import clsx from "clsx";
import { getCardRank, getCardRankIndex, getCardSuit } from "../util/cards";
import { CardProps } from "./Card";

/**
 * Returns whether the card rank should be upside down at the given index.
 * FIXME: This is a bit of a hack, but it works for now.
 *
 * @param index The index of the rank symbol on the card's face
 * @param rank The rank of the card
 */
function getIsUpsideDown(index: number, rank: number) {
  if (rank === 0) {
    return false;
  } else if (rank === 5) {
    return index > 3;
  } else {
    return index >= rank / 2;
  }
}

export function CardFace({ card }: CardProps) {
  const suit = getCardSuit(card);
  const rank = getCardRank(card);
  const rankIndex = getCardRankIndex(card);

  const indices = (
    <>
      <span>{rank}</span>
      <span>{suit}</span>
    </>
  );

  return (
    <div className="face" data-suit={suit} data-rank={rank}>
      <div className="back" />
      <div className="front">
        <div className="corner top-left">{indices}</div>
        <div className="center">
          {rankIndex < 10 ? (
            Array.from({ length: rankIndex + 1 }, (_, i) => (
              <span
                key={i}
                className={clsx(
                  "rank",
                  getIsUpsideDown(i, rankIndex) && "upside-down"
                )}
              >
                {suit}
              </span>
            ))
          ) : (
            <span className="rank">{rank}</span>
          )}
        </div>
        <div className="corner bottom-right">{indices}</div>
      </div>
    </div>
  );
}
