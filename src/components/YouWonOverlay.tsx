import clsx from "clsx";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { gameIsWonState } from "../state/game";

export function YouWonOverlay() {
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
    <div className={clsx("you-won-overlay", delayedIsGameWon && "visible")}>
      <span className="message">You Won!</span>
    </div>
  ) : null;
}
