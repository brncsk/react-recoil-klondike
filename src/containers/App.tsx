import { useEffect } from "react";

import {
  useGameShortcutListeners,
  useNewGame,
  useUpdateElapsedTime,
} from "../hooks/game";

import { Board } from "../components/Board";
import { Hud } from "../components/hud/Hud";
import { GameOverlay } from "../components/GameOverlay";

import { HistoryRoot } from "./HistoryRoot";

function App() {
  const newGame = useNewGame();
  useEffect(() => void newGame(), [newGame]);
  useGameShortcutListeners();
  useUpdateElapsedTime();

  return (
    <HistoryRoot>
      <Board />
      <Hud />
      <GameOverlay />
    </HistoryRoot>
  );
}

export default App;
