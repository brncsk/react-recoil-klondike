import type { Card as CardType } from "./model";
import { getCardColor, getCardRank, getCardSuit } from "./util";

interface CardProps {
  card: CardType;
  faceUp?: boolean;
  onDoubleClick?: () => void;
}

export function Card({ card, faceUp = false, onDoubleClick }: CardProps) {
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

  return (
    <div
      className={`card ${faceUp ? "face-up" : "face-down"}`}
      style={{ color }}
      onDoubleClick={onDoubleClick}
    >
      <div className="corner top-left">{indices}</div>
      <div className="center">{suit}</div>
      <div className="corner bottom-right">{indices}</div>
    </div>
  );
}
