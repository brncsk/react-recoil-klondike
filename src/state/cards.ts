import { atom, atomFamily, selectorFamily } from "recoil";

import { Stack, Card } from "../types";
import {
  getStackType,
  getStackNumber,
  getStackFanoutOffset,
} from "../util/stacks";

import { stackCardsState, stackRectState } from "./stacks";

/** The stack that a card is currently in. */
export const cardStackState = atomFamily<Stack, Card>({
  key: "card-stack",
  default: "deck",
});

/**
 * The size of a card in CSS pixels.
 * @see `useMeasureCardSize()` in `hooks/cards.ts`.
 */
export const cardSizeState = atom<{ width: number; height: number }>({
  key: "card-size",
  default: { width: 0, height: 0 },
});

/** Returns the topmost card in a stack. */
export const topmostCardState = selectorFamily<Card | null, Stack>({
  key: "topmost-card",
  get:
    (stack) =>
    ({ get }) => {
      const cards = get(stackCardsState(stack));
      return cards.length > 0 ? cards.slice(-1)[0] : null;
    },
});

/** Returns whether a card is the topmost card in its stack. */
export const cardIsTopmostState = selectorFamily<boolean, Card>({
  key: "card-is-topmost",
  get:
    (card) =>
    ({ get }) => {
      const stack = get(cardStackState(card));
      const topmostCard = get(topmostCardState(stack));

      return topmostCard === card;
    },
});

/** Returns whether a card is face-up (i.e. visible and interactable). */
export const cardIsFaceUpState = selectorFamily<boolean, Card>({
  key: "card-is-face-up",
  get:
    (card) =>
    ({ get }) => {
      const stack = get(cardStackState(card));
      const stackIndex = get(cardStackIndexState(card));

      const stackNumCards = get(stackCardsState(stack)).length;
      const numFaceUpCards = get(stackNumFaceUpCardsState(stack));

      return stackIndex >= stackNumCards - numFaceUpCards;
    },
});

/** Stores the number of cards that are face-up in a tableau stack. */
export const tableauNumFaceUpCardsState = atomFamily<number, number>({
  key: "tableau-num-face-up-cards",
  default: 1,
});

/** Returns the number of cards that are face-up in a stack. */
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

/** Returns the index of a card in its stack. */
export const cardStackIndexState = selectorFamily<number, Card>({
  key: "card-stack-index",
  get:
    (card) =>
    ({ get }) => {
      const stack = get(cardStackState(card));
      const cards = get(stackCardsState(stack));

      return cards.findIndex((c) => c === card);
    },
});

/**
 * Returns the position of a card in CSS pixels relative to the top-left corner
 * of the viewport.
 */
export const cardPositionState = selectorFamily<{ x: number; y: number }, Card>(
  {
    key: "card-static-position",
    get:
      (card) =>
      ({ get }) => {
        const stack = get(cardStackState(card));
        const stackNumCards = get(stackCardsState(stack)).length;
        const stackNumFaceUpCards = get(stackNumFaceUpCardsState(stack));
        const stackPosition = get(stackRectState(stack));
        const stackIndex = get(cardStackIndexState(card));

        const fanoutOffset = getStackFanoutOffset(
          getStackType(stack),
          get(cardSizeState).height,
          stackNumCards,
          stackNumFaceUpCards,
          stackIndex
        );

        let cardOffset = { x: 0, y: 0 };

        return {
          x: stackPosition.x + cardOffset.x + fanoutOffset.x,
          y: stackPosition.y + cardOffset.y + fanoutOffset.y,
        };
      },
  }
);

/**
 * Returns the list of cards that would be moved if the user was to initiate
 * a drag on the given card.
 * Used for pre-emptively determining the list of cards for a drag, so
 * initiating a drag is more performant (no state updates during the drag).
 */
export const cardDragListState = selectorFamily<Card[], Card>({
  key: "card-drag-list",
  get:
    (card) =>
    ({ get }) => {
      // If the card is face-down, no cards (including the card itself) can be
      // moved via drag.
      if (!get(cardIsFaceUpState(card))) {
        return [];
      }

      const stack = get(cardStackState(card));

      // Only a single card can be moved from non-tableau stacks.
      if (getStackType(stack) !== "tableau") {
        return [card];
      }

      // Return all cards above the card in the stack, including the card
      // itself.
      const stackIndex = get(cardStackIndexState(card));
      const cards = get(stackCardsState(stack));

      return cards.slice(stackIndex);
    },
});
