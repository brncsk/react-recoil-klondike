import { getCardRank, getCardSuit } from "../util";
import { CardProps } from "./Card";

export function CardFace({ card }: CardProps) {
  const suit = getCardSuit(card);
  const rank = getCardRank(card);

  const indices = (
    <>
      {rank}
      <br />
      {suit}
    </>
  );

  return (
    <>
      <div className="back" />
      <div className="front">
        <div className="corner top-left">{indices}</div>
        <div className="center">{suit}</div>
        <div className="corner bottom-right">{indices}</div>
      </div>
    </>
  );
}
