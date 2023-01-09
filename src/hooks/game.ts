import { useCallback, useContext, useEffect } from "react";
import { useRecoilCallback } from "recoil";

import { Card, CardDragInfo, Stack } from "../types";
import {
  NUM_CARDS_PER_SUIT,
  NUM_FOUNDATION_STACKS,
  NUM_TABLEAU_STACKS,
} from "../const";

import {
  cardStackState,
  tableauNumFaceUpCardsState,
  topmostCardState,
} from "../state/cards";
import { stackCardsState } from "../state/stacks";
import { gameIsWonState } from "../state/game";

import { shuffleDeck, generateDeck } from "../util/deck";
import {
  tableauStack,
  foundationStack,
  getStackType,
  getStackNumber,
} from "../util/stacks";
import { HistoryContext } from "../util/history";

import { canDropOntoFoundation, canDropOntoTableau } from "./stacks";

/** Returns a function that deals a new game. */
export function useNewGame() {
  const { reset: resetHistory } = useContext(HistoryContext);

  return useRecoilCallback(
    ({ set, reset }) =>
      () => {
        set(gameIsWonState, false);
        const deck = shuffleDeck(generateDeck());

        // Deal the deck into the tableau
        for (let i = 1; i <= NUM_TABLEAU_STACKS; i++) {
          const cards = deck.splice(0, i);
          set(stackCardsState(tableauStack(i)), cards);

          // Assign stacks to cards
          for (const card of cards) {
            set(cardStackState(card), tableauStack(i));
          }
        }

        // Deal the rest into the deck
        set(stackCardsState("deck"), deck);

        // Assign stacks to cards
        for (const card of deck) {
          set(cardStackState(card), "deck");
        }

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

        // Reset the history
        resetHistory();
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

        // Update the stack of the cards we moved
        for (const card of movedCards) {
          set(cardStackState(card), targetStack);
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
    ({ set, snapshot: { getLoadable: get }, transact_UNSTABLE: transact }) =>
      () => {
        const deck = get(stackCardsState("deck")).valueOrThrow();
        const waste = get(stackCardsState("waste")).valueOrThrow();

        if (deck.length > 0) {
          moveCard("deck", "waste");
        } else {
          transact(() => {
            set(stackCardsState("deck"), waste.slice().reverse());
            set(stackCardsState("waste"), []);

            // Update the stack of the cards we moved
            for (const card of waste) {
              set(cardStackState(card), "deck");
            }
          });
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
  const moveCard = useMoveCard();

  return useRecoilCallback(
    ({ snapshot: { getLoadable: get } }) =>
      (stack: Stack, foundationOnly = false) => {
        const card = get(topmostCardState(stack)).valueOrThrow();

        if (!card) {
          return;
        }

        const dragInfo: CardDragInfo = {
          type: "single",
          sourceStack: stack,
          card,
        };

        for (let i = 1; i <= NUM_FOUNDATION_STACKS; i++) {
          const topmostCardOnTarget = get(
            topmostCardState(foundationStack(i))
          ).valueOrThrow();

          if (canDropOntoFoundation(dragInfo, topmostCardOnTarget)) {
            moveCard(stack, foundationStack(i));
            return;
          }
        }

        if (!foundationOnly) {
          for (let i = 1; i <= NUM_TABLEAU_STACKS; i++) {
            const topmostCardOnTarget = get(
              topmostCardState(tableauStack(i))
            ).valueOrThrow();

            if (canDropOntoTableau(dragInfo, topmostCardOnTarget)) {
              moveCard(stack, tableauStack(i));
              return;
            }
          }
        }
      },
    [moveCard]
  );
}

/** Returns a function that determines if the game is won. */
export function useIsGameWon() {
  return useRecoilCallback(
    ({ snapshot: { getLoadable: get } }) =>
      () => {
        for (let i = 1; i <= NUM_FOUNDATION_STACKS; i++) {
          const cards = get(stackCardsState(foundationStack(i))).valueOrThrow();

          if (cards.length !== NUM_CARDS_PER_SUIT) {
            return false;
          }
        }

        return true;
      },
    []
  );
}

export function useGameShortcutListeners() {
  const newGame = useNewGame();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const hasModifier = event.metaKey || event.ctrlKey;

      if ((hasModifier && event.key === "n") || event.key === "F2") {
        event.preventDefault();
        newGame();
      }
    },
    [newGame]
  );

  return useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function useWinAnimation() {
  return useRecoilCallback(({ set }) => () => {
    generateDeck().forEach((card) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const cardElement = document.querySelector(
        `[data-card="${card}"]`
      )! as HTMLElement;
      // cardElement.style.setProperty("--animation-delay", `${Math.random() * 1000}ms`);
      cardElement.style.setProperty(
        "--won-spread-x",
        `${Math.random() * viewportWidth}px`
      );
      cardElement.style.setProperty(
        "--won-spread-y",
        `${Math.random() * viewportHeight}px`
      );
      cardElement.style.setProperty(
        "--won-rotation",
        `${Math.random() * 360 - 180}deg`
      );
      cardElement.style.setProperty(
        "--won-scale",
        `${Math.random() * 2.5 + 0.5}`
      );

      cardElement.style.setProperty(
        "--won-transition-delay",
        `${Math.random() * 500}ms`
      );
    });

    set(gameIsWonState, true);
  });
}
