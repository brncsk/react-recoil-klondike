import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import clsx from "clsx";

import { gameIsWonState, gamePausedState } from "../state/game";

export function GameOverlay() {
  const isGameWon = useRecoilValue(gameIsWonState);
  const isGamePaused = useRecoilValue(gamePausedState);
  const [delayedIsGameWon, setDelayedIsGameWon] = useState(false);

  useEffect(() => {
    if (isGameWon) {
      const timeout = setTimeout(() => setDelayedIsGameWon(true), 1000);
      return () => clearTimeout(timeout);
    } else {
      setDelayedIsGameWon(false);
    }
  }, [isGameWon]);

  const overlayVisible = delayedIsGameWon || isGamePaused;
  const overlayMessage = isGamePaused ? "Paused" : "You Won!";

  return overlayVisible ? (
    <div className={clsx("game-overlay", overlayVisible && "visible")}>
      <span className="message">{overlayMessage}</span>
    </div>
  ) : null;
}
