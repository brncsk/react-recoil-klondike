import { Dispatch, useCallback, useEffect } from "react";
import { useRecoilCallback } from "recoil";

import { HistoryAction, HistoryState } from "../types";
import { isDevelopment } from "../util/env";
import { dumpHistoryStateToConsole, TRACKED_ATOMS } from "../util/history";

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

/**
 * Returns a function that maps a history frame onto the current recoil state by
 * setting all tracked atoms to their values at that point in time, then
 * going to the newly created snapshot. All non-tracked atoms are left in their
 * current state (think timers, etc. which should not be reset when undoing).
 *
 * The function also replaces the current snapshot with the new one in the
 * history state, so that history is always in sync with the current state.
 */
export function useMapHistoryFrameOntoCurrentSnapshot() {
  return useRecoilCallback(
    ({ snapshot: current, gotoSnapshot }) =>
      ({ stack, pointer }: HistoryState) => {
        const { snapshot: oldSnapshot, release: releaseOldSnapshot } =
          stack[pointer];

        // eslint-disable-next-line array-callback-return
        const newSnapshot = current.map(({ set }) => {
          for (const atom of TRACKED_ATOMS) {
            const value = oldSnapshot.getLoadable(atom);

            if (value.state === "hasValue") {
              set(atom, value.contents);
            }
          }
        });

        // Retain the new snapshot so it doesn't get garbage collected.
        const release = newSnapshot.retain();

        // Release the old snapshot so it can be garbage collected.
        releaseOldSnapshot();

        isDevelopment &&
          console.log(
            `Replacing snapshot ${oldSnapshot.getID()} with ${newSnapshot.getID()} at index ${pointer} (length: ${
              stack.length
            })`
          );

        // Replace the current snapshot with the new one.
        stack = [
          ...stack.splice(pointer, 1, { snapshot: newSnapshot, release }),
        ];

        // Jump to the new snapshot.
        gotoSnapshot(newSnapshot);

        isDevelopment && dumpHistoryStateToConsole({ stack, pointer });

        // Return the new world for the reducer to update the state.
        return { stack, pointer };
      },
    []
  );
}
