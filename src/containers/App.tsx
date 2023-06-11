import { useEffect } from "react";
import { useRecoilValue } from "recoil";

import {
  useFinishTriviallyWinnableGame,
  useGameShortcutListeners,
  useNewGame,
  useUpdateElapsedTime,
} from "../hooks/game";

import { gameIsTriviallyWinnableState } from "../state/game";
import { stackPositionsHaveBeenInitializedState } from "../state/stacks";

import { Board } from "../components/Board";
import { Hud } from "../components/hud/Hud";
import { GameOverlay } from "../components/GameOverlay";

import { HistoryRoot } from "./HistoryRoot";

/**
 * The delay between when the stack positions are initialized and when a new
 * game is initialized.
 *
 * This should be the same as the transition delay for the cards' `opacity`
 * property in `src/styles/card.css`.
 */
const NEW_GAME_DELAY_MS = 200;

function App() {
  const newGame = useNewGame();
  const stackPositionsHaveBeenInitialized = useRecoilValue(
    stackPositionsHaveBeenInitializedState
  );

  // Initialize a new game only after the stack positions have been initialized.
  useEffect(() => {
    if (stackPositionsHaveBeenInitialized) {
      setTimeout(() => {
        newGame();
      }, NEW_GAME_DELAY_MS);
    }
  }, [newGame, stackPositionsHaveBeenInitialized]);

  useGameShortcutListeners();
  useUpdateElapsedTime();

  const isTriviallyWinnable = useRecoilValue(gameIsTriviallyWinnableState);
  const finishTrivially = useFinishTriviallyWinnableGame();

  useEffect(() => {
    if (isTriviallyWinnable) {
      finishTrivially();
    }
  }, [isTriviallyWinnable, finishTrivially]);

  return (
    <HistoryRoot>
      <Board />
      <Hud />
      <GameOverlay />
    </HistoryRoot>
  );
}

export default App;
