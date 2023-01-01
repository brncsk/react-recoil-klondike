import { useEffect } from "react";

import { useNewGame } from "./hooks";

import { Board } from "./components/Board";
import { DragPreview } from "./components/DragPreview";

function App() {
  const newGame = useNewGame();
  useEffect(() => void newGame(), [newGame]);

  return (
    <>
      <button onClick={newGame}>Deal New Game</button>
      <Board />
      <DragPreview />
    </>
  );
}

export default App;
