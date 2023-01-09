import { useRecoilValue } from "recoil";
import { ReactComponent as WinIcon } from "@material-design-icons/svg/filled/auto_fix_high.svg";

import { useWinAnimation } from "../../hooks/game";
import { gameIsTriviallyWinnableState, gameIsWonState } from "../../state/game";
import { HudButton } from "./HudButton";

export function HudDebugPane() {
  const isTriviallyWinnable = useRecoilValue(gameIsTriviallyWinnableState);
  const isGameWon = useRecoilValue(gameIsWonState);
  const performWinAnimation = useWinAnimation();

  return (
    <div className="debug">
      <HudButton
        icon={<WinIcon />}
        caption="Win"
        onClick={performWinAnimation}
        disabled={false}
      />
      <div className="stats">
        Triv: {isTriviallyWinnable ? "✅" : "❌"}
        <br />
        Won: {isGameWon ? "✅" : "❌"}
      </div>
    </div>
  );
}
