import { atom, atomFamily, selectorFamily } from "recoil";

import { Card, CardDragInfo, Stack } from "./types";
import { getTableauFanoutOffset, getStackNumber, getStackType } from "./util";

/** Stores the cards in a stack. */
export const stackCardsState = atomFamily<Card[], Stack>({
  key: "stack",
  default: [],
});

export const cardStackState = atomFamily<Stack, Card>({
  key: "card-stack",
  default: "deck",
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

export const stackPositionState = atomFamily<{ x: number; y: number }, Stack>({
  key: "stack-position",
  default: { x: 0, y: 0 },
});

/** Returns details about the current drag operation. */
export const dragInfoState = atom<CardDragInfo | null>({
  key: "drag-info",
  default: null,
});

/** Returns whether a card is being dragged. */
export const cardDraggedState = atomFamily<boolean, Card>({
  key: "card-dragged",
  default: false,
});

export const dragInitialOffsetState = atom<{ x: number; y: number }>({
  key: "drag-initial-offset",
  default: { x: 0, y: 0 },
});

export const dragOffsetState = atom<{ x: number; y: number }>({
  key: "drag-offset",
  default: { x: 0, y: 0 },
});

export const cardStaticPositionState = selectorFamily<
  { x: number; y: number },
  Card
>({
  key: "card-static-position",
  get:
    (card) =>
    ({ get }) => {
      const stack = get(cardStackState(card));
      const stackNumCards = get(stackCardsState(stack)).length;
      const stackNumFaceUpCards = get(stackNumFaceUpCardsState(stack));
      const stackPosition = get(stackPositionState(stack));
      const stackIndex = get(cardStackIndexState(card));

      const fanoutOffset =
        getStackType(stack) === "tableau"
          ? getTableauFanoutOffset(
              stackNumCards,
              stackNumFaceUpCards,
              stackIndex
            )
          : 0;

      let cardOffset = { x: 0, y: 0 };

      return {
        x: stackPosition.x + cardOffset.x,
        y: stackPosition.y + cardOffset.y + fanoutOffset,
      };
    },
});

export const cardPositionState = selectorFamily<{ x: number; y: number }, Card>(
  {
    key: "card-position",
    get:
      (card) =>
      ({ get }) => {
        const staticPosition = get(cardStaticPositionState(card));
        const isDragged = get(cardDraggedState(card));

        if (isDragged) {
          const dragOffset = get(dragOffsetState);
          const dragInitialOffset = get(dragInitialOffsetState);

          return {
            x: staticPosition.x + dragOffset.x - dragInitialOffset.x,
            y: staticPosition.y + dragOffset.y - dragInitialOffset.y,
          };
        }

        return staticPosition;
      },
  }
);

export const cardZIndexState = selectorFamily<number, Card>({
  key: "card-z-index",
  get:
    (card) =>
    ({ get }) => {
      const stack = get(cardStackState(card));
      const cardIndex = get(cardStackIndexState(card));
      const dragged = get(cardDraggedState(card));

      let stackZIndex = 0;

      switch (getStackType(stack)) {
        case "deck":
          stackZIndex = 10;
          break;
        case "waste":
          stackZIndex = 20;
          break;
        case "tableau":
          stackZIndex = 30 + getStackNumber(stack);
          break;
        case "foundation":
          stackZIndex = 40 + getStackNumber(stack);
          break;
      }

      return cardIndex * 100 + stackZIndex + (dragged ? 10000 : 0);
    },
});
