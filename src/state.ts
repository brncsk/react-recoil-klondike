import { atomFamily, selectorFamily } from "recoil";

import { Card, Stack } from "./model";
import { getStackNumber, getStackType } from "./util";

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
      switch (getStackType(stack)) {
        // The deck is always face-down
        case "deck":
          return 0;

        // Waste and foundation stacks are always face-up
        case "waste":
        case "foundation":
          return get(stackCardsState(stack)).length;

        // Tableau stacks have a variable number of face-up cards
        // depending on the number of cards that have been moved to them
        case "tableau":
          return get(tableauNumFaceUpCardsState(getStackNumber(stack)));
      }
    },
});
