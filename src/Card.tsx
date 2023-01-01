import { useDrag } from "react-dnd";

import { Card as CardType, CardDragInfo, Stack } from "./model";
import { getCardColor, getCardRank, getCardSuit } from "./util";

interface CardProps {
  card: CardType;
  stack: Stack;
  faceUp?: boolean;
  onDoubleClick?: () => void;
}

export function Card({
  card,
  stack,
  faceUp = false,
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

  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: { card, stack } as CardDragInfo,

    canDrag() {
      return faceUp;
    },

    collect(monitor) {
      return {
        isDragging: !!monitor.isDragging(),
      };
    },
  });

  return (
    <div
      ref={drag}
      className={`card ${faceUp ? "face-up" : "face-down"}`}
      style={{
        color,
        opacity: isDragging ? 0 : 1,
        transform: `scale(${isDragging ? 1.1 : 1})`,
      }}
      onDoubleClick={onDoubleClick}
    >
      <div className="corner top-left">{indices}</div>
      <div className="center">{suit}</div>
      <div className="corner bottom-right">{indices}</div>
    </div>
  );
}
