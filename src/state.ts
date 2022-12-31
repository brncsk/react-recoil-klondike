import { atomFamily, selectorFamily } from "recoil";

import { Card, Stack } from "./model";
import { getStackNumber } from "./util";

export const stackCardsState = atomFamily<Card[], Stack>({
  key: "stack",
  default: [],
});

export const topmostCardState = selectorFamily<Card | null, Stack>({
  key: "topmost-card",
  get:
    (stack) =>
    ({ get }) => {
      const cards = get(stackCardsState(stack));
      return cards.length > 0 ? cards.slice(-1)[0] : null;
    },
});

export const tableauNumFaceUpCardsState = atomFamily<number, number>({
  key: "tableau-num-face-up-cards",
  default: 1,
});

export const stackNumFaceUpCardsState = selectorFamily<number, Stack>({
  key: "stack-num-face-up-cards",
  get:
    (stack) =>
    ({ get }) => {
      if (stack === "deck") {
        // The deck is always face down
        return 0;
      } else if (stack === "waste" || stack.startsWith("foundation-")) {
        // The waste and foundations are always face up
        return get(stackCardsState(stack)).length;
      } else {
        // Tableaus are partially face up depending on the number of cards
        // that have been moved to them
        const tableauNum = getStackNumber(stack);
        return get(tableauNumFaceUpCardsState(tableauNum));
      }
    },
});
