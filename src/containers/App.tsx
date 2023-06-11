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

function App() {
  const newGame = useNewGame();
  const stackPositionsHaveBeenInitialized = useRecoilValue(
    stackPositionsHaveBeenInitializedState
  );

  // Initialize a new game only after the stack positions have been initialized.
  useEffect(() => {
    if (stackPositionsHaveBeenInitialized) {
      newGame();
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
