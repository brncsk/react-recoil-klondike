import { useEffect } from "react";
import { useRecoilValue } from "recoil";

import {
  useFinishTriviallyWinnableGame,
  useGameShortcutListeners,
  useNewGame,
  useUpdateElapsedTime,
} from "../hooks/game";
import { gameIsTriviallyWinnableState } from "../state/game";

import { Board } from "../components/Board";
import { Hud } from "../components/hud/Hud";
import { GameOverlay } from "../components/GameOverlay";

import { HistoryRoot } from "./HistoryRoot";

function App() {
  const newGame = useNewGame();
  useEffect(() => void newGame(), [newGame]);
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
