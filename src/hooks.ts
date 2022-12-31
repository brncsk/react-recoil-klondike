import { useRecoilCallback } from "recoil";

import { NUM_FOUNDATION_STACKS, NUM_TABLEAU_STACKS, Stack } from "./model";

import {
  stackCardsState,
  tableauNumFaceUpCardsState,
  topmostCardState,
} from "./state";

import {
  generateDeck,
  getStackType,
  getCardRank,
  getCardRankIndex,
  getCardSuit,
  getStackNumber,
  tableauStack,
  foundationStack,
  getCardColor,
} from "./util";

/** Returns a function that deals a new game. */
export function useNewGame() {
  return useRecoilCallback(
    ({ set, reset }) =>
      () => {
        const deck = generateDeck();

        // Deal the deck into the tableau
        for (let i = 1; i <= NUM_TABLEAU_STACKS; i++) {
          set(stackCardsState(tableauStack(i)), deck.splice(0, i));
        }

        // Deal the rest into the deck
        set(stackCardsState("deck"), deck);

        // Reset the waste
        reset(stackCardsState("waste"));

        // Reset the foundations
        for (let i = 1; i <= NUM_FOUNDATION_STACKS; i++) {
          reset(stackCardsState(foundationStack(i)));
        }

        // Reset the number of face-up cards in the tableaus
        for (let i = 1; i <= NUM_TABLEAU_STACKS; i++) {
          reset(tableauNumFaceUpCardsState(i));
        }
      },
    []
  );
}

/** Returns a function that determines whether a card can be moved from one stack to another. */
export function useCanMoveBetweenStacks() {
  return useRecoilCallback(
    ({ snapshot: { getPromise: get } }) =>
      async (fromStack: Stack, toStack: Stack) => {
        const fromType = getStackType(fromStack);
        const toType = getStackType(toStack);

        const topmostFromCard = await get(topmostCardState(fromStack));
        const topmostToCard = await get(topmostCardState(toStack));

        // Moving from empty stacks is not allowed
        if (topmostFromCard === null) {
          return false;
        }

        // Moving to empty stacks (either foundations or tableaus)

        if (topmostToCard === null) {
          return (
            // Aces can be moved to empty foundations
            (getCardRank(topmostFromCard) === "A" && toType === "foundation") ||
            // Kings can be moved to empty tableaus
            (getCardRank(topmostFromCard) === "K" && toType === "tableau")
          );
        }

        // Cards can be moved from the waste or another tableau to a tableau
        // if the rank is one less and the color is different

        if (fromType === "tableau" || fromType === "waste") {
          if (toType === "tableau") {
            return (
              getCardRankIndex(topmostFromCard) ===
                getCardRankIndex(topmostToCard) - 1 &&
              getCardColor(topmostFromCard) !== getCardColor(topmostToCard)
            );
          }
        }

        // Cards can be moved from a tableau or waste to a foundation if the
        // rank is one more and the suit is the same

        if (fromType === "tableau" || fromType === "waste") {
          if (toType === "foundation") {
            return (
              getCardRankIndex(topmostFromCard) ===
                getCardRankIndex(topmostToCard) + 1 &&
              getCardSuit(topmostFromCard) === getCardSuit(topmostToCard)
            );
          }
        }

        return false;
      },
    []
  );
}

/** Moves a card from one stack to another. */
export function useMoveCard() {
  return useRecoilCallback(
    ({ set, snapshot: { getPromise: get } }) =>
      async (fromStack: Stack, toStack: Stack) => {
        const fromCards = await get(stackCardsState(fromStack));
        const toCards = await get(stackCardsState(toStack));

        set(stackCardsState(fromStack), fromCards.slice(0, -1));
        set(stackCardsState(toStack), [...toCards, fromCards.slice(-1)[0]]);

        // If we moved a card from a tableau, increase the number of face-up
        // cards in that tableau by one
        if (getStackType(toStack) === "tableau") {
          set(
            tableauNumFaceUpCardsState(getStackNumber(toStack)),
            (num) => num + 1
          );
        }
      },
    []
  );
}

/**
 * Returns a function that deals a card from the deck to the waste, or moves
 * the waste back to the deck if the deck is empty.
 */
export function useDealFromDeck() {
  const moveCard = useMoveCard();

  return useRecoilCallback(
    ({ set, snapshot: { getPromise: get } }) =>
      async () => {
        const deck = await get(stackCardsState("deck"));
        const waste = await get(stackCardsState("waste"));

        if (deck.length > 0) {
          moveCard("deck", "waste");
        } else {
          set(stackCardsState("deck"), waste.slice().reverse());
          set(stackCardsState("waste"), []);
        }
      },
    []
  );
}

/**
 * Returns a function that automatically moves the last card in a stack to
 * another stack if possible.
 *
 * @param foundationOnly If true, only move to foundations, not tableaus.
 */
export function useAutoMove() {
  const canMoveBetweenStacks = useCanMoveBetweenStacks();
  const moveCard = useMoveCard();

  return useRecoilCallback(
    () =>
      async (stack: Stack, foundationOnly = false) => {
        for (let i = 1; i <= 4; i++) {
          if (await canMoveBetweenStacks(stack, foundationStack(i))) {
            moveCard(stack, foundationStack(i));
            return;
          }
        }

        if (!foundationOnly) {
          for (let i = 1; i <= NUM_TABLEAU_STACKS; i++) {
            if (await canMoveBetweenStacks(stack, tableauStack(i))) {
              moveCard(stack, tableauStack(i));
              return;
            }
          }
        }
      },
    []
  );
}
