import { useContext } from "react";
import { useRecoilValue } from "recoil";

import { useNewGame, useWinAnimation } from "../hooks/game";
import { gameIsTriviallyWinnableState, gameIsWonState } from "../state/game";
import { HistoryContext } from "../util/history";

const isDev = process.env.NODE_ENV === "development";

function HudButton({
  icon,
  caption,
  onClick,
  disabled,
}: {
  icon: string;
  caption: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled}>
      <span className="icon">{icon}</span>
      <br />
      <span className="caption">{caption}</span>
    </button>
  );
}

export function Hud() {
  const newGame = useNewGame();
  const performWinAnimation = useWinAnimation();
  const { canUndo, canRedo, undo, redo } = useContext(HistoryContext);

  const isTriviallyWinnable = useRecoilValue(gameIsTriviallyWinnableState);
  const isGameWon = useRecoilValue(gameIsWonState);

  return (
    <div className="hud">
      <HudButton
        icon="🔄"
        caption="Deal New"
        onClick={newGame}
        disabled={false}
      />
      <HudButton icon="↩️" caption="Undo" onClick={undo} disabled={!canUndo} />
      <HudButton icon="↪️" caption="Redo" onClick={redo} disabled={!canRedo} />
      {isDev && (
        <>
          <HudButton
            icon="🎉"
            caption="Win"
            onClick={performWinAnimation}
            disabled={false}
          />
          <div className="debug">
            Triv: {isTriviallyWinnable ? "✅" : "❌"}
            <br />
            Won: {isGameWon ? "✅" : "❌"}
          </div>
        </>
      )}
    </div>
  );
}
