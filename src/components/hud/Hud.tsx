import { useContext } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { ReactComponent as NewGameIcon } from "@material-design-icons/svg/filled/auto_awesome.svg";
import { ReactComponent as UndoIcon } from "@material-design-icons/svg/filled/undo.svg";
import { ReactComponent as RedoIcon } from "@material-design-icons/svg/filled/redo.svg";
import { ReactComponent as PauseIcon } from "@material-design-icons/svg/filled/pause.svg";
import { ReactComponent as RestartIcon } from "@material-design-icons/svg/filled/replay.svg";

import { useNewGame } from "../../hooks/game";
import { HistoryContext } from "../../util/history";
import { isDevelopment } from "../../util/env";
import { formatTime } from "../../util/time";

import {
  gameElapsedSecondsState,
  gameMovesState,
  gameOverlayVisibleState,
  gamePausedState,
} from "../../state/game";

import { HudButton } from "./HudButton";
import { HudDebugPane } from "./HudDebugPane";

function HudSeparator() {
  return <div className="separator" />;
}

export function Hud() {
  const { canUndo, canRedo, canRestart, undo, redo, restart } =
    useContext(HistoryContext);

  const elapsedSeconds = useRecoilValue(gameElapsedSecondsState);
  const moves = useRecoilValue(gameMovesState);

  const [isGamePaused, setGamePaused] = useRecoilState(gamePausedState);
  const overlayVisible = useRecoilValue(gameOverlayVisibleState);

  const newGame = useNewGame();

  return (
    <div className="hud">
      <HudButton
        icon={<NewGameIcon />}
        caption="Deal New"
        onClick={newGame}
        disabled={false}
      />
      <HudButton
        icon={<RestartIcon />}
        caption="Restart"
        onClick={restart}
        disabled={!canRestart || !!overlayVisible}
      />
      <HudSeparator />
      <HudButton
        icon={<UndoIcon />}
        caption="Undo"
        onClick={undo}
        disabled={!canUndo || !!overlayVisible}
      />
      <HudButton
        icon={<RedoIcon />}
        caption="Redo"
        onClick={redo}
        disabled={!canRedo || !!overlayVisible}
      />
      <HudSeparator />
      <HudButton
        icon={
          isGamePaused ? (
            <PauseIcon />
          ) : (
            <span className="text">{formatTime(elapsedSeconds)}</span>
          )
        }
        caption={`Time (${isGamePaused ? "Continue" : "Pause"})`}
        onClick={() => setGamePaused((paused) => !paused)}
        disabled={overlayVisible === "WON"}
      />
      <HudButton
        icon={<span className="text">{moves}</span>}
        caption="Moves"
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
