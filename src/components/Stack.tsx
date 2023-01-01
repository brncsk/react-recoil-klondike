import { useRecoilValue } from "recoil";
import { useDrop } from "react-dnd";

import { CardDragInfo, Stack as StackId } from "../model";
import { stackCardsState, stackNumFaceUpCardsState } from "../state";
import { getStackGridColumn, getStackType } from "../util";
import { useAutoMove, useCanMoveBetweenStacks, useMoveCard } from "../hooks";

import { Card } from "./Card";

interface StackProps {
  stack: StackId;
  onClick?: () => void;
}

export function Stack({ stack, onClick }: StackProps) {
  const cards = useRecoilValue(stackCardsState(stack));
  const numFaceUp = useRecoilValue(stackNumFaceUpCardsState(stack));
  const isFannedOut = stack.startsWith("tableau");

  const autoMove = useAutoMove();
  const moveCard = useMoveCard();
  const canMove = useCanMoveBetweenStacks();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept:
      getStackType(stack) === "tableau" ? ["single", "multiple"] : "single",

    canDrop(item: CardDragInfo) {
      return canMove(item.sourceStack, stack, item.card);
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

  const style: React.CSSProperties = {
    gridColumn: getStackGridColumn(stack),
  };

  if (isFannedOut) {
    style.gridTemplateRows = [
      `repeat(${cards.length - numFaceUp}, var(--card-fanout-gap-face-down))`,
      `repeat(${numFaceUp}, var(--card-fanout-gap-face-up))`,
    ].join(" ");
  }

  if (isOver && canDrop) {
    style.backgroundColor = "var(--color-stack-hover)";
  }

  return (
    <div
      ref={drop}
      className={`stack ${stack} ${isFannedOut ? "fanned-out" : ""}`}
      style={style}
      onClick={onClick}
    >
      {cards.map((card, index) => {
        const topmost = index === cards.length - 1;

        return (
          <Card
            key={index}
            stack={stack}
            card={card}
            faceUp={index >= cards.length - numFaceUp}
            topmost={topmost}
            onDoubleClick={topmost ? () => autoMove(stack) : undefined}
          />
        );
      })}
    </div>
  );
}
