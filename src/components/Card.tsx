import { useEffect } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import clsx from "clsx";

import { useAutoMove } from "../hooks";
import { Card as CardType, CardDragInfo, Stack } from "../types";
import { getCardColor, getCardRank, getCardSuit } from "../util";

interface CardProps {
  card: CardType;
  stack?: Stack;
  visible?: boolean;
  faceUp?: boolean;
  topmost?: boolean;
}

export function Card({
  card,
  stack,
  visible = true,
  faceUp = false,
  topmost = false,
}: CardProps) {
  const suit = getCardSuit(card);
  const rank = getCardRank(card);
  const color = getCardColor(card);

  const indices = (
    <>
      {rank}
      <br />
      {suit}
    </>
  );

  const [{ isDragging }, drag, preview] = useDrag(() => {
    const type: CardDragInfo["type"] = topmost ? "single" : "multiple";

    return {
      type,
      item: { type, card, sourceStack: stack } as CardDragInfo,
      canDrag: faceUp,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    };
  }, [card, topmost, faceUp]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const autoMove = useAutoMove();

  return (
    <div
      // Only set the drag ref if we have a stack (e.g. not in the preview)
      ref={stack ? drag : undefined}
      className={clsx(
        "card",
        color,
        faceUp ? "face-up" : "face-down",
        visible && !isDragging ? "visible" : "hidden"
      )}
      onDoubleClick={
        topmost && visible && faceUp && stack
          ? () => autoMove(stack)
          : undefined
      }
    >
      <div className="corner top-left">{indices}</div>
      <div className="center">{suit}</div>
      <div className="corner bottom-right">{indices}</div>
    </div>
  );
}
