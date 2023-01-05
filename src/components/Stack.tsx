import { useRecoilState } from "recoil";
import clsx from "clsx";

import { useDealFromDeck } from "../hooks";

import { Card } from "./Card";

interface StackProps {
  stack: StackId;
  onClick?: () => void;
}

function getStackStyle({
  stack,
  cards,
  numFaceUp,
}: {
  stack: StackId;
  cards: CardDragInfo["card"][];
  numFaceUp: number;
}) {
  const style: React.CSSProperties = {
    gridColumn: getStackGridColumn(stack),
  };

  // If the stack is a tableau, we need to set the grid template rows so that
  // the cards are spaced out correctly.
  //
  // We use `repeat()` twice, once for the face-down cards and once for the
  // face-up cards (face-up cards are spaced out more than face-down cards).
  //
  // We use the CSS custom properties `--card-fanout-gap-face-down` and
  // `--card-fanout-gap-face-up` to control the spacing (see `index.css`).
  if (getStackType(stack) === "tableau") {
    const numFaceDown = Math.max(cards.length - numFaceUp, 0);
    const gridTemplateRows = [];

    if (numFaceDown > 0) {
      gridTemplateRows.push(
        `repeat(${numFaceDown}, var(--card-fanout-gap-face-down))`
      );
    }

    if (numFaceUp > 0) {
      gridTemplateRows.push(
        `repeat(${numFaceUp}, var(--card-fanout-gap-face-up))`
      );
    }

    style.gridTemplateRows = gridTemplateRows.join(" ");
  }

  return style;
}

export function Stack({ stack, onClick }: StackProps) {
  const cards = useRecoilValue(stackCardsState(stack));
  const numFaceUp = useRecoilValue(stackNumFaceUpCardsState(stack));

  const monitor = useDragDropManager().getMonitor();

  const moveCard = useMoveCard();
  const isValidMove = useIsValidMove();

  const [lastVisibleCardIndex, setLastVisibleCardIndex] = useState<
    number | null
  >(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept:
      getStackType(stack) === "tableau" ? ["single", "multiple"] : "single",

    canDrop(item: CardDragInfo) {
      return isValidMove(item.sourceStack, stack, item.card);
    },

    async drop({ sourceStack, card }: CardDragInfo) {
      moveCard(sourceStack, stack, card);
    },

    collect(monitor) {
      return {
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      };
    },
  });

  // Hide cards that are being dragged
  useEffect(
    () =>
      monitor.subscribeToStateChange(() => {
        if (monitor.isDragging()) {
          const { sourceStack, card } = monitor.getItem() as CardDragInfo;
          if (sourceStack === stack) {
            setLastVisibleCardIndex(cards.indexOf(card) - 1);
          }
        } else {
          setLastVisibleCardIndex(null);
        }
      }),

    [monitor, stack, cards]
  );

  return (
    <div
      ref={drop}
      className={clsx(
        "stack",
        getStackType(stack),
        stack,
        isOver && canDrop && "drop-target"
      )}
      style={getStackStyle({
        stack,
        cards,
        numFaceUp,
      })}
      onClick={getStackType(stack) === "deck" ? dealFromDeck : undefined}
  );
}
