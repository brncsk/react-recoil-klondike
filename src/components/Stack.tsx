import { useCallback, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import clsx from "clsx";

import { Stack as StackId } from "../types";
import { stackPositionState } from "../state";
import { debounce, getStackGridColumn, getStackType } from "../util";
import { useDealFromDeck } from "../hooks";

const STACK_REPOSITION_DEBOUNCE_TIMEOUT_MS = 500;

export function Stack({ stack }: { stack: StackId }) {
  const ref = useRef<HTMLDivElement>(null);
  const dealFromDeck = useDealFromDeck();

  const [stackPosition, setStackPosition] = useRecoilState(
    stackPositionState(stack)
  );

  const updatePosition = useCallback(() => {
    // Set the stack position so that we can use it to calculate the
    // position of the cards in the stack.

    if (!ref.current) {
      return;
    }

    const { x, y } = ref.current.getBoundingClientRect();

    if (stackPosition.x === x && stackPosition.y === y) {
      return;
    }

    setStackPosition({ x, y });
  }, [stackPosition, setStackPosition]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });

    resizeObserver.observe(document.body);
    debounce(updatePosition, STACK_REPOSITION_DEBOUNCE_TIMEOUT_MS);

    return () => resizeObserver.disconnect();
  }, [updatePosition]);

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
      ref={ref}
      className={clsx("stack", getStackType(stack), stack, {
      })}
      style={{ gridColumn: getStackGridColumn(stack) }}
      onClick={getStackType(stack) === "deck" ? dealFromDeck : undefined}
    />
  );
}
