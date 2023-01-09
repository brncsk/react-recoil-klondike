import { useContext } from "react";
import { useRecoilValue } from "recoil";

import { useNewGame, useWinAnimation } from "../hooks/game";
import { gameIsTriviallyWinnableState, gameIsWonState } from "../state/game";
import { HistoryContext } from "../util/history";

const isDev = process.env.NODE_ENV === "development";

export function Hud() {
  const newGame = useNewGame();
  const performWinAnimation = useWinAnimation();
  const { canUndo, canRedo, undo, redo } = useContext(HistoryContext);

  const isTriviallyWinnable = useRecoilValue(gameIsTriviallyWinnableState);
  const isGameWon = useRecoilValue(gameIsWonState);

  return (
    <div className="hud">
      <button onClick={newGame}>Deal New</button>
      <button onClick={undo} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={redo} disabled={!canRedo}>
        Redo
      </button>
      {isDev && (
        <>
          <button onClick={performWinAnimation}>Win</button>
          <div>
            Triv: {isTriviallyWinnable ? "Yes" : "No"} <br />
            Won: {isGameWon ? "Yes" : "No"}
          </div>
        </>
      )}
    </div>
  );
}
