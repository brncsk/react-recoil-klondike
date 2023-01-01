import { useCallback } from "react";
import { useRecoilCallback } from "recoil";

import { Card, Stack } from "./model";

import {
  NUM_FOUNDATION_STACKS,
  NUM_TABLEAU_STACKS,
  NUM_CARDS_PER_SUIT,
} from "./const";

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

/**
 * Returns a function that determines whether a move is valid from one stack
 * to another, optionally specifying the bottommost card to move from the
 * source stack (handy for moving multiple cards at once by dragging between
 * tableaus).
 *
 * @param sourceStack The stack to move the card from
 * @param targetStack The stack to move the card to
 * @param bottommostCardFromSource Specifies the bottommost card to move from
 *   the source stack. All cards above this card will be moved. If not
 *   specified, the topmost card in the source stack is used.
 */
export function useIsValidMove() {
  return useRecoilCallback(
    ({ snapshot: { getLoadable: get } }) =>
      (
        sourceStack: Stack,
        targetStack: Stack,
        bottommostCardFromSource: Card | null = get(
          topmostCardState(sourceStack)
        ).valueOrThrow() ?? null
      ) => {
        const sourceStackType = getStackType(sourceStack);
        const targetStackType = getStackType(targetStack);

        const topmostCardOnTarget = get(
          topmostCardState(targetStack)
        ).valueOrThrow();

        // Moving from empty stacks is not allowed
        if (bottommostCardFromSource === null) {
          return false;
        }

        // Moving to empty stacks (either foundations or tableaus)
        if (topmostCardOnTarget === null) {
          return (
            // Aces can be moved to empty foundations
            (getCardRank(bottommostCardFromSource) === "A" &&
              targetStackType === "foundation") ||
            // Kings can be moved to empty tableaus
            (getCardRank(bottommostCardFromSource) === "K" &&
              targetStackType === "tableau")
          );
        }

        // Cards can be moved from the waste, a foundation, or another tableau
        // to a tableau if the rank is one less and the color is different
        if (
          (sourceStackType === "tableau" ||
            sourceStackType === "waste" ||
            sourceStackType === "foundation") &&
          targetStackType === "tableau"
        ) {
          return (
            getCardRankIndex(bottommostCardFromSource) ===
              getCardRankIndex(topmostCardOnTarget) - 1 &&
            getCardColor(bottommostCardFromSource) !==
              getCardColor(topmostCardOnTarget)
          );
        }

        // Cards can be moved from a tableau or waste to a foundation if the
        // rank is one more and the suit is the same
        if (
          (sourceStackType === "tableau" || sourceStackType === "waste") &&
          targetStackType === "foundation"
        ) {
          return (
            getCardRankIndex(bottommostCardFromSource) ===
              getCardRankIndex(topmostCardOnTarget) + 1 &&
            getCardSuit(bottommostCardFromSource) ===
              getCardSuit(topmostCardOnTarget)
          );
        }

        return false;
      },
    []
  );
}

/**
 * Moves one or more cards from one stack to another, optionally specifying
 * the bottommost card to move from the source stack (handy for moving
 * multiple cards at once by dragging between tableaus).
 *
 * @param sourceStack The stack to move the card from
 * @param targetStack The stack to move the card to
 * @param bottommostCardFromSource Specifies the bottommost card to move from
 *   the source stack. All cards above this card will be moved. If not
 *   specified, the topmost card in the source stack is used.
 */
export function useMoveCard() {
  return useRecoilCallback(
    ({ set, snapshot: { getLoadable: get } }) =>
      (
        sourceStack: Stack,
        targetStack: Stack,
        bottommostCardFromSource: Card | null = null
      ) => {
        const sourceCards = get(stackCardsState(sourceStack)).valueOrThrow();
        const targetCards = get(stackCardsState(targetStack)).valueOrThrow();

        // Find the index of the bottom card in the from stack
        // (or the top card if no bottommost card was specified)
        const bottommostCardIndex = bottommostCardFromSource
          ? sourceCards.findIndex((card) => card === bottommostCardFromSource)
          : sourceCards.length - 1;

        const movedCards = sourceCards.slice(bottommostCardIndex);
        const remainingCards = sourceCards.slice(0, bottommostCardIndex);

        set(stackCardsState(sourceStack), remainingCards);
        set(stackCardsState(targetStack), [...targetCards, ...movedCards]);

        // If the from stack is a tableau, update the number of face-up cards
        // in the tableau
        if (getStackType(sourceStack) === "tableau") {
          const sourceStackNumber = getStackNumber(sourceStack);
          set(tableauNumFaceUpCardsState(sourceStackNumber), (num) =>
            Math.max(remainingCards.length > 0 ? 1 : 0, num - movedCards.length)
          );
        }

        // If we moved a card to a tableau, increase the number of face-up
        // cards in that tableau by the number of cards we moved
        if (getStackType(targetStack) === "tableau") {
          set(
            tableauNumFaceUpCardsState(getStackNumber(targetStack)),
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
 * Returns a function that automatically moves the topmost card in a stack to
 * another stack if possible.
 *
 * @param stack The stack to move the topmost card from
 * @param foundationOnly If true, only move to foundations, not tableaus.
 */
export function useAutoMove() {
  const isValidMove = useIsValidMove();
  const moveCard = useMoveCard();

  return useCallback(
    (stack: Stack, foundationOnly = false) => {
      for (let i = 1; i <= NUM_FOUNDATION_STACKS; i++) {
        if (isValidMove(stack, foundationStack(i))) {
          moveCard(stack, foundationStack(i));
          return;
        }
      }

      if (!foundationOnly) {
        for (let i = 1; i <= NUM_TABLEAU_STACKS; i++) {
          if (isValidMove(stack, tableauStack(i))) {
            moveCard(stack, tableauStack(i));
            return;
          }
        }
      }
    },
    [isValidMove, moveCard]
  );
}
