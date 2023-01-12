import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import clsx from "clsx";

import { gameOverlayVisibleState } from "../state/game";

const OVERLAY_DELAY_MS = 500;

export function GameOverlay() {
  const overlayVisible = useRecoilValue(gameOverlayVisibleState);
  const [overlayVisibleDelayed, setOverlayVisibleDelayed] = useState(false);

  useEffect(() => {
    if (overlayVisible) {
      const timeout = setTimeout(
        () => setOverlayVisibleDelayed(true),
        OVERLAY_DELAY_MS
      );
      return () => clearTimeout(timeout);
    } else {
      setOverlayVisibleDelayed(false);
    }
  }, [overlayVisible]);

  const overlayMessage = overlayVisible === "WON" ? "You Won!" : "Paused";

  return overlayVisible ? (
    <div className={clsx("game-overlay", overlayVisibleDelayed && "visible")}>
      <span className="message">{overlayMessage}</span>
    </div>
  ) : null;
}
