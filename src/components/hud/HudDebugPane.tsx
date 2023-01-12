import { useRecoilValue } from "recoil";
import { ReactComponent as WinIcon } from "@material-design-icons/svg/filled/auto_fix_high.svg";

import { useWinAnimation } from "../../hooks/game";
import {
  gameIsTriviallyWinnableState,
  gameIsWonState,
  gameStartedState,
} from "../../state/game";

import { HudButton } from "./HudButton";

function HudDebugStat({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: boolean;
  tooltip?: string;
}) {
  return (
    <div className="stat" title={tooltip}>
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
    <>
      <HudButton
        icon={<WinIcon />}
        caption="Win"
        onClick={performWinAnimation}
        disabled={false}
      />
      <div className="stats item">
        <HudDebugStat label="S" tooltip="Game Started" value={gameStarted} />
        <HudDebugStat
          label="T"
          tooltip="Trivially Winnable"
          value={isTriviallyWinnable}
        />
        <HudDebugStat label="W" tooltip="Game Won" value={isGameWon} />
      </div>
    </>
  );
}
