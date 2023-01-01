import { useEffect } from "react";

import { useNewGame } from "./hooks";

import { Board } from "./components/Board";
import { Hud } from "./components/Hud";
import { DragPreview } from "./components/DragPreview";

function App() {
  const newGame = useNewGame();
  useEffect(() => void newGame(), [newGame]);

  return (
    <>
      <Board />
      <Hud />
      <DragPreview />
    </>
  );
}

export default App;
