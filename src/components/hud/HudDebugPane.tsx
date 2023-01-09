import { useRecoilValue } from "recoil";
import { ReactComponent as WinIcon } from "@material-design-icons/svg/filled/auto_fix_high.svg";

import { useWinAnimation } from "../../hooks/game";
import {
  gameIsTriviallyWinnableState,
  gameIsWonState,
  gameStartedState,
} from "../../state/game";

import { HudButton } from "./HudButton";

function HudDebugStat({ label, value }: { label: string; value: boolean }) {
  return (
    <div>
      {label}: {value ? "✅" : "❌"}
    </div>
  );
}

export function HudDebugPane() {
  const isTriviallyWinnable = useRecoilValue(gameIsTriviallyWinnableState);
  const isGameWon = useRecoilValue(gameIsWonState);
  const performWinAnimation = useWinAnimation();
  const gameStarted = useRecoilValue(gameStartedState);

  return (
    <div className="debug">
      <HudButton
        icon={<WinIcon />}
        caption="Win"
        onClick={performWinAnimation}
        disabled={false}
      />
      <div className="stats">
        <HudDebugStat label="Game started" value={gameStarted} />
        <HudDebugStat label="Trivially winnable" value={isTriviallyWinnable} />
        <HudDebugStat label="Won" value={isGameWon} />
      </div>
    </div>
  );
}
