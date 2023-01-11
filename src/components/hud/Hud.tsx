import { useContext } from "react";

import { ReactComponent as NewGameIcon } from "@material-design-icons/svg/filled/auto_awesome.svg";
import { ReactComponent as UndoIcon } from "@material-design-icons/svg/filled/undo.svg";
import { ReactComponent as RedoIcon } from "@material-design-icons/svg/filled/redo.svg";

import { useNewGame } from "../../hooks/game";
import { HistoryContext } from "../../util/history";

import { HudButton } from "./HudButton";
import { HudDebugPane } from "./HudDebugPane";
import { isDevelopment } from "../../util/env";
import { useRecoilValue } from "recoil";
import { gameElapsedSecondsState } from "../../state/game";
import { formatTime } from "../../util/time";

function HudSeparator() {
  return <div className="separator" />;
}

export function Hud() {
  const elapsedSeconds = useRecoilValue(gameElapsedSecondsState);
  const newGame = useNewGame();
  const { canUndo, canRedo, undo, redo } = useContext(HistoryContext);

  return (
    <div className="hud">
      <HudButton
        icon={<NewGameIcon />}
        caption="Deal New"
        onClick={newGame}
        disabled={false}
      />
      <HudButton
        icon={<UndoIcon />}
        caption="Undo"
        onClick={undo}
        disabled={!canUndo}
      />
      <HudButton
        icon={<RedoIcon />}
        caption="Redo"
        onClick={redo}
        disabled={!canRedo}
      />
      <HudSeparator />
      <HudButton
        icon={<span className="text">{formatTime(elapsedSeconds)}</span>}
        caption="Time"
        onClick={() => {}}
        disabled={true}
      />

      {isDevelopment && (
        <>
          <HudSeparator />
          <HudDebugPane />
        </>
      )}
    </div>
  );
}
