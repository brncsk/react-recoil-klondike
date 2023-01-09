import { useContext } from "react";

import { useNewGame } from "../../hooks/game";
import { HistoryContext } from "../../util/history";

import { HudButton } from "./HudButton";
import { HudDebugPane } from "./HudDebugPane";

const isDev = process.env.NODE_ENV === "development";

export function Hud() {
  const newGame = useNewGame();
  const { canUndo, canRedo, undo, redo } = useContext(HistoryContext);

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
      {isDev && <HudDebugPane />}
    </div>
  );
}
