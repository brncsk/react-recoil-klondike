import { useRecoilCallback } from "recoil";

import {
  Card,
  Stack,
  NUM_FOUNDATION_STACKS,
  NUM_TABLEAU_STACKS,
} from "./model";

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
    ({ snapshot: { getLoadable: get } }) =>
      (
        fromStack: Stack,
        toStack: Stack,
        bottommostFromCard: Card | null = get(
          topmostCardState(fromStack)
        ).valueOrThrow() ?? null
      ) => {
        const fromType = getStackType(fromStack);
        const toType = getStackType(toStack);

        const topmostToCard = get(topmostCardState(toStack)).valueOrThrow();

        // Moving from empty stacks is not allowed
        if (bottommostFromCard === null) {
          return false;
        }

        // Moving to empty stacks (either foundations or tableaus)
        if (topmostToCard === null) {
          return (
            // Aces can be moved to empty foundations
            (getCardRank(bottommostFromCard) === "A" &&
              toType === "foundation") ||
            // Kings can be moved to empty tableaus
            (getCardRank(bottommostFromCard) === "K" && toType === "tableau")
          );
        }

        // Cards can be moved from the waste or another tableau to a tableau
        // if the rank is one less and the color is different
        if (fromType === "tableau" || fromType === "waste") {
          if (toType === "tableau") {
            return (
              getCardRankIndex(bottommostFromCard) ===
                getCardRankIndex(topmostToCard) - 1 &&
              getCardColor(bottommostFromCard) !== getCardColor(topmostToCard)
            );
          }
        }

        // Cards can be moved from a tableau or waste to a foundation if the
        // rank is one more and the suit is the same
        if (fromType === "tableau" || fromType === "waste") {
          if (toType === "foundation") {
            return (
              getCardRankIndex(bottommostFromCard) ===
                getCardRankIndex(topmostToCard) + 1 &&
              getCardSuit(bottommostFromCard) === getCardSuit(topmostToCard)
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
    ({ set, snapshot: { getLoadable: get } }) =>
      (fromStack: Stack, toStack: Stack, bottommostCard?: Card) => {
        const fromCards = get(stackCardsState(fromStack)).valueOrThrow();
        const toCards = get(stackCardsState(toStack)).valueOrThrow();

        // Find the index of the bottom card in the from stack
        const bottomCardIndex = bottommostCard
          ? fromCards.findIndex((card) => card === bottommostCard)
          : fromCards.length - 1;

        const movedCards = fromCards.slice(bottomCardIndex);

        set(stackCardsState(fromStack), fromCards.slice(0, bottomCardIndex));
        set(stackCardsState(toStack), [...toCards, ...movedCards]);

        // If the from stack is a tableau, update the number of face-up cards
        // in the tableau
        if (getStackType(fromStack) === "tableau") {
          const fromStackNumber = getStackNumber(fromStack);
          set(tableauNumFaceUpCardsState(fromStackNumber), (num) =>
            Math.max(1, num - movedCards.length)
          );
        }

        // If we moved a card to a tableau, increase the number of face-up
        // cards in that tableau by the number of cards we moved
        if (getStackType(toStack) === "tableau") {
          set(
            tableauNumFaceUpCardsState(getStackNumber(toStack)),
            (num) => num + movedCards.length
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
    ({ set, snapshot: { getLoadable: get } }) =>
      () => {
        const deck = get(stackCardsState("deck")).valueOrThrow();
        const waste = get(stackCardsState("waste")).valueOrThrow();

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
      (stack: Stack, foundationOnly = false) => {
        for (let i = 1; i <= 4; i++) {
          if (canMoveBetweenStacks(stack, foundationStack(i))) {
            moveCard(stack, foundationStack(i));
            return;
          }
        }

        if (!foundationOnly) {
          for (let i = 1; i <= NUM_TABLEAU_STACKS; i++) {
            if (canMoveBetweenStacks(stack, tableauStack(i))) {
              moveCard(stack, tableauStack(i));
              return;
            }
          }
        }
      },
    []
  );
}
