import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import clsx from "clsx";

import { gameIsWonState } from "../state/game";

export function GameOverlay() {
  const isGameWon = useRecoilValue(gameIsWonState);
  const [delayedIsGameWon, setDelayedIsGameWon] = useState(false);

  useEffect(() => {
    if (isGameWon) {
      const timeout = setTimeout(() => setDelayedIsGameWon(true), 1000);
      return () => clearTimeout(timeout);
    } else {
      setDelayedIsGameWon(false);
    }
  }, [isGameWon]);

  return isGameWon ? (
    <div className={clsx("game-overlay", delayedIsGameWon && "visible")}>
      <span className="message">You Won!</span>
    </div>
  ) : null;
}
