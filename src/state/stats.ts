import { DefaultValue, atom, selector, selectorFamily } from "recoil";

import { GameStats } from "../types";
import { localStorageEffect } from "../util/persistence";

const NEW_GAME_STATS: GameStats = {
  time: 0,
  moves: 0,
  won: false,
};

export const statsState = atom<GameStats[]>({
  key: "stats",
  default: [],
  effects: [localStorageEffect("stats")],
});

/** Returns the current game's stats. */
export const currentGameStatsState = selector<GameStats>({
  key: "current-game-stats",
  get: ({ get }) => {
    const stats = get(statsState);
    return stats[stats.length - 1];
  },

  set: ({ set }, newStats) => {
    if (newStats instanceof DefaultValue) {
      // If the new stats are a `DefaultValue`, (e.g. when the state is reset),
      // start a new game.
      // (This is called from `useNewGame` in `src/hooks/game.ts`.)
      set(statsState, (stats) => [...stats, { ...NEW_GAME_STATS }]);
    } else {
      // Otherwise, update the current game's stats.
      set(statsState, (stats) => [
        ...stats.slice(0, stats.length - 1),
        newStats,
      ]);
    }
  },
});

/** Returns the number of games played. */
export const numGamesPlayedState = selector({
  key: "num-games-played",
  get: ({ get }) => {
    const stats = get(statsState);

    return stats.length;
  },
});

/** Returns the number of games won and lost. */
export const numWinsAndLossesState = selector({
  key: "num-wins-and-losses",
  get: ({ get }) => {
    const stats = get(statsState);

    return stats.reduce(
      (acc, { won }) => {
        if (won) {
          acc.wins++;
        } else {
          acc.losses++;
        }

        return acc;
      },
      { wins: 0, losses: 0 }
    );
  },
});

/**
 * Returns the longest consecutive winning or losing streak.
 *
 * @param winOrLose Whether to return the longest winning or losing streak.
 */
export const longestWinningOrLosingStreakState = selectorFamily<
  number,
  boolean
>({
  key: "longest-winning-or-losing-streak",
  get:
    (winOrLose: boolean) =>
    ({ get }) => {
      const stats = get(statsState);

      return stats.reduce((max, { won }) => {
        if (won === winOrLose) {
          return max + 1;
        }

        return 0;
      }, 0);
    },
});

/**
 * Returns the current winning or losing streak.
 *
 * @returns An object with the following properties:
 * - `winning`: Whether the current streak is a winning streak.
 * - `streakLength`: The length of the current streak.
 */
export const currentStreakState = selector<{
  winning: boolean;
  streakLength: number;
} | null>({
  key: "current-streak",
  get: ({ get }) => {
    const stats = get(statsState);
    const lastGame = stats[stats.length - 1];

    // If there are no games, there is no current streak.
    if (!lastGame) {
      return null;
    }

    const { won: winning } = lastGame;
    let streakLength = 0;

    // Count the number of consecutive games with the same outcome,
    // starting from the last game, incrementing `streakLength` for
    // each.
    for (let i = stats.length - 1; i >= 0; i--, streakLength++) {
      if (stats[i].won !== winning) {
        break;
      }
    }

    return { winning, streakLength };
  },
});

/** Returns the best time for a game won. */
export const bestTimeState = selector({
  key: "best-time",
  get: ({ get }) => {
    const stats = get(statsState);

    return stats.reduce((best, { time, won }) => {
      if (!won) {
        return best;
      }

      if (time < best) {
        return time;
      }

      return best;
    }, Infinity);
  },
});

/** Returns the best moves for a game won. */
export const leastMovesState = selector({
  key: "least-moves",
  get: ({ get }) => {
    const stats = get(statsState);

    return stats.reduce((least, { moves, won }) => {
      if (!won) {
        return least;
      }

      if (moves < least) {
        return moves;
      }

      return least;
    }, Infinity);
  },
});
