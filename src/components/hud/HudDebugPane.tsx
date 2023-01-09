import { useRecoilValue } from "recoil";
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
        icon="🎉"
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
