import { useContext } from "react";

import { useNewGame } from "../hooks/game";
import { HistoryContext } from "../util/history";

export function Hud() {
  const newGame = useNewGame();
  const { canUndo, canRedo, undo, redo } = useContext(HistoryContext);

  return (
    <div className="hud">
      <button onClick={newGame}>Deal New</button>
      <button onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo
      </button>
    </div>
  );
}
