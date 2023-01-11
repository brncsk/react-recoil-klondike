import { atom, selector } from "recoil";

import { NUM_TABLEAU_STACKS } from "../const";
import { tableauStack } from "../util/stacks";
import { tableauNumFaceUpCardsState } from "./cards";
import { stackCardsState } from "./stacks";

export const gameStartedState = atom({
  key: "game-started",
  default: false,
});

export const gameElapsedSecondsState = atom({
  key: "game-elapsed-time",
  default: 0,
});

export const gameIsWonState = atom({
  key: "game-is-won",
  default: false,
});

/**
 * Returns whether the game is trivially winnable.
 * A game is trivially winnable if the deck is empty and all tableau stacks are
 * fully face-up.
 */
export const gameIsTriviallyWinnableState = selector({
  key: "game-is-trivially-winnable",
  get: ({ get }) => {
    const deckCardCount = get(stackCardsState("deck"));

    if (deckCardCount.length !== 0) {
      return false;
    }

    for (let i = 1; i <= NUM_TABLEAU_STACKS; i++) {
      const tableauCardCount = get(stackCardsState(tableauStack(i)));
      const numFaceUpCards = get(tableauNumFaceUpCardsState(i));

      if (tableauCardCount.length !== numFaceUpCards) {
        return false;
      }
    }

    return true;
  },
});
