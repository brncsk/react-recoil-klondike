import { useEffect } from "react";

import { useGameShortcutListeners, useNewGame } from "../hooks/game";

import { Board } from "../components/Board";
import { Hud } from "../components/Hud";
import { YouWonOverlay } from "../components/YouWonOverlay";

import { HistoryRoot } from "./HistoryRoot";

function App() {
  const newGame = useNewGame();
  useEffect(() => void newGame(), [newGame]);
  useGameShortcutListeners();

  return (
    <HistoryRoot>
      <Board />
      <Hud />
      <YouWonOverlay />
    </HistoryRoot>
  );
}

export default App;
