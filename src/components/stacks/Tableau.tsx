import { useStack } from "../../hooks/stacks";
import { Rank } from "../../types";
import { getCardColor, getCardRank, getCardRankIndex } from "../../util";

export function Tableau({ n }: { n: number }) {
  return (
    <div
      {...useStack({
        stack: `tableau-${n}`,
        gridColumn: 1,
        canDrop(dragInfo, topmostCard) {
          if (!topmostCard) {
            // Empty stack, only kings can be dropped
            return getCardRank(dragInfo.card) === Rank.King;
          } else {
            // Non-empty stack, only cards of the opposite color
            // and one rank lower can be dropped
            return (
              getCardRankIndex(dragInfo.card) ===
                getCardRankIndex(topmostCard) - 1 &&
              getCardColor(dragInfo.card) !== getCardColor(topmostCard)
            );
          }
        },
      })}
    />
  );
}
