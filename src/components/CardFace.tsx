import clsx from "clsx";

import { getCardColor, getCardRank, getCardSuit } from "../util";
import { CardProps } from "./Card";

export function CardFace({ card, visible = true, faceUp = false }: CardProps) {
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
      className={clsx(
        "card",
        "face",
        color,
        faceUp ? "face-up" : "face-down",
        visible ? "visible" : "hidden"
      )}
    >
      <div className="back" />
      <div className="front">
        <div className="corner top-left">{indices}</div>
        <div className="center">{suit}</div>
        <div className="corner bottom-right">{indices}</div>
      </div>
    </div>
  );
}
