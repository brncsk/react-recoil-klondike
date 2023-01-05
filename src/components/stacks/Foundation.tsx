import { useStack } from "../../hooks/stacks";
import { Rank } from "../../types";
import { getCardColor, getCardRank, getCardRankIndex } from "../../util";

export function Foundation({ n }: { n: number }) {
  return (
    <div
      {...useStack({
        stack: `foundation-${n}`,
        gridColumn: 1,
        canDrop(dragInfo, topmostCard) {
          if (dragInfo.type === "multiple") {
            // Multiple cards can't be dropped on a foundation
            return false;
          }

          if (!topmostCard) {
            // Empty foundation, only aces can be dropped
            return getCardRank(dragInfo.card) === Rank.Ace;
          } else {
            // Non-empty stack, only cards of the same suit
            // and one rank higher can be dropped
            return (
              getCardRankIndex(dragInfo.card) ===
                getCardRankIndex(topmostCard) + 1 &&
              getCardColor(dragInfo.card) === getCardColor(topmostCard)
            );
          }
        },
      })}
    />
  );
}
