import { useEffect } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import { Card as CardType, CardDragInfo, Stack } from "../model";
import { getCardColor, getCardRank, getCardSuit } from "../util";

interface CardProps {
  card: CardType;
  stack?: Stack;
  faceUp?: boolean;
  topmost?: boolean;
  onDoubleClick?: () => void;
}

export function Card({
  card,
  stack,
  faceUp = false,
  topmost = false,
  onDoubleClick,
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

  const dragType: CardDragInfo["type"] = topmost ? "single" : "multiple";

  const [{ isDragging }, drag, preview] = useDrag({
    type: dragType,
    item: { type: dragType, card, sourceStack: stack } as CardDragInfo,
    canDrag: faceUp,

    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <div
      // Only set the drag ref if we have a stack (e.g. not in the preview)
      ref={stack ? drag : undefined}
      className={`card ${faceUp ? "face-up" : "face-down"}`}
      style={{ color, opacity: isDragging ? 0 : 1 }}
      onDoubleClick={onDoubleClick}
    >
      <div className="corner top-left">{indices}</div>
      <div className="center">{suit}</div>
      <div className="corner bottom-right">{indices}</div>
    </div>
  );
}
