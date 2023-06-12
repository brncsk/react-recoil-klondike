import { DefaultValue, atom, selector } from "recoil";

import { NUM_TABLEAU_STACKS } from "../const";
import { getCardRankIndex } from "../util/cards";
import { isDevelopment } from "../util/env";
import { tableauStack } from "../util/stacks";

import { tableauNumFaceUpCardsState } from "./cards";
import { stackCardsState } from "./stacks";
import { currentGameStatsState } from "./stats";

export type GameOverlayType = "paused" | "won";

/** Whether the game has started (i.e. the first valid move has been made). */
export const gameStartedState = atom({
  key: "game-started",
  default: false,
});

/** Whether the game is paused. */
export const gamePausedState = atom({
  key: "game-paused",
  default: false,
  effects: [
    // Pause the game when the browser tab is hidden or the window is not
    // in focus.
    ({ setSelf }) => {
      if (!isDevelopment) {
        document.addEventListener("visibilitychange", () =>
          setSelf(document.hidden)
        );

        window.addEventListener("blur", () => setSelf(true));
        window.addEventListener("focus", () => setSelf(false));
      }
    },
  ],
});

/** The number of seconds elapsed since the game started. */
export const gameElapsedSecondsState = selector({
  key: "game-elapsed-time",
  get: ({ get }) => get(currentGameStatsState)?.time ?? 0,
  set: ({ set }, time) => {
    if (time instanceof DefaultValue) return;
    set(currentGameStatsState, (s) => ({ ...s, time }));
  },
});

/** The number of moves made in the game. */
export const gameMovesState = selector({
  key: "game-moves",
  get: ({ get }) => get(currentGameStatsState)?.moves ?? 0,
  set: ({ set }, moves) => {
    if (moves instanceof DefaultValue) return;
    set(currentGameStatsState, (s) => ({ ...s, moves }));
  },
});

/** Whether the game is won. */
export const gameIsWonState = selector({
  key: "game-is-won",
  get: ({ get }) => get(currentGameStatsState)?.won ?? false,
  set: ({ set }, won) => {
    if (won instanceof DefaultValue) return;
    set(currentGameStatsState, (s) => ({ ...s, won }));
  },
});

/**
 * Returns whether the game is trivially winnable.
 * A game is trivially winnable if the deck is empty, all tableau stacks are
 * fully face-up and cards in the waste stack are in descending order.
 */
export const gameIsTriviallyWinnableState = selector({
  key: "game-is-trivially-winnable",
  get: ({ get }) => {
    const deckCardCount = get(stackCardsState("deck"));

    // Check if the deck is empty.
    if (deckCardCount.length !== 0) {
      return false;
    }

    // Check if cards in the waste stack are in descending order.
    const wasteCards = get(stackCardsState("waste"));

    for (let i = 0; i < wasteCards.length - 1; i++) {
      // The card [i] (which is below the card [i + 1] in the waste stack)
      // should have a higher-or-equal rank than the card [i + 1].
      //
      // Higher ranks on top might block lower ranks from being moved to the
      // foundation thus making the game unwinnable by auto-move.
      //
      // The direction of the comparison is reversed so we can bail at the
      // first non-descending pair.
      if (
        getCardRankIndex(wasteCards[i]) <= getCardRankIndex(wasteCards[i + 1])
      ) {
        return false;
      }
    }

    // Check if all tableau stacks are fully face-up.
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

/** Returns whether the game overlay should be shown. */
export const gameOverlayTypeState = selector<GameOverlayType | null>({
  key: "game-overlay-type",
  get: ({ get }) => {
    return get(gamePausedState) ? "paused" : get(gameIsWonState) ? "won" : null;
  },
});
