import { useEffect } from "react";
import { Board } from "./components/Board";

import { useNewGame } from "./hooks";

function App() {
  const newGame = useNewGame();

  useEffect(() => {
    newGame();
  }, [newGame]);

  return (
    <>
      <button onClick={newGame}>Deal New Game</button>
      <Board />
    </>
  );
}

export default App;
