import { useEffect } from "react";

import { useNewGame } from "./hooks";

import { Board } from "./components/Board";
import { Hud } from "./components/Hud";

function App() {
  const newGame = useNewGame();
  useEffect(() => void newGame(), [newGame]);

  return (
    <>
      <Board />
      <Hud />
    </>
  );
}

export default App;
