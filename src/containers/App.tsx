import { useEffect } from "react";

import { useNewGame } from "../hooks/game";

import { Board } from "../components/Board";
import { Hud } from "../components/Hud";

import { HistoryRoot } from "./HistoryRoot";

function App() {
  const newGame = useNewGame();
  useEffect(() => void newGame(), [newGame]);

  return (
    <HistoryRoot>
      <Board />
      <Hud />
    </HistoryRoot>
  );
}

export default App;
