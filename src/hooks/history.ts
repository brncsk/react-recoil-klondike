import { Dispatch, useCallback, useEffect } from "react";
import { HistoryAction } from "../util/history";

export function useHistoryShortcutListeners(
  historyDispatch: Dispatch<HistoryAction>
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const hasModifier = event.metaKey || event.ctrlKey;

      if (hasModifier) {
        if (event.key === "z") {
          event.preventDefault();
          historyDispatch({ type: "undo" });
        } else if (event.key === "y" || (event.shiftKey && event.key === "z")) {
          event.preventDefault();
          historyDispatch({ type: "redo" });
        }
      }
    },
    [historyDispatch]
  );

  return useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
