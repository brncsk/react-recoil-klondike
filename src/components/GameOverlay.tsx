import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import clsx from "clsx";

import { gameOverlayTypeState } from "../state/game";

const OVERLAY_DELAY_MS = 500;

export function GameOverlay() {
  const overlayType = useRecoilValue(gameOverlayTypeState);
  const [overlayVisibleDelayed, setOverlayVisibleDelayed] = useState(false);

  useEffect(() => {
    if (overlayType !== null) {
      const timeout = setTimeout(
        () => setOverlayVisibleDelayed(true),
        OVERLAY_DELAY_MS
      );
      return () => clearTimeout(timeout);
    } else {
      setOverlayVisibleDelayed(false);
    }
  }, [overlayType]);

  const overlayMessage = overlayType === "won" ? "You Won!" : "Paused";

  return overlayType ? (
    <div className={clsx("game-overlay", overlayVisibleDelayed && "visible")}>
      <span className="message">{overlayMessage}</span>
    </div>
  ) : null;
}
