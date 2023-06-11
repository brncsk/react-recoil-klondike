import { Dispatch, useCallback, useEffect } from "react";
import { useRecoilCallback } from "recoil";

import { HistoryAction, HistoryState } from "../types";
import { isDevelopment } from "../util/env";
import {
  assertSnapshotIsRetained,
  dumpHistoryStateToConsole,
  TRACKED_ATOMS,
} from "../util/history";

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
        assertSnapshotIsRetained(current);

        const { snapshot: oldSnapshot, release: releaseOldSnapshot } =
          stack[pointer];

        dumpHistoryStateToConsole({ stack, pointer });
        assertSnapshotIsRetained(oldSnapshot);

        // eslint-disable-next-line array-callback-return
        const newSnapshot = current.map((snapshot) => {
          for (const atom of TRACKED_ATOMS) {
            const value = oldSnapshot.getLoadable(atom);

            if (value.state === "hasValue") {
              snapshot.set(atom, value.contents);
            } else {
              throw new Error(
                `Cannot map history frame onto current snapshot because the value of ${atom.key} was not available at that point in time.`
              );
            }
          }
        });

        // Retain the new snapshot so it doesn't get garbage collected.
        const release = newSnapshot.retain();

        isDevelopment &&
          console.log(
            `Replacing snapshot ${oldSnapshot.getID()} with ${newSnapshot.getID()} at index ${pointer} (length: ${
              stack.length
            })`
          );

        // Replace the current snapshot with the new one.
        stack = [
          ...stack.slice(0, pointer),
          { snapshot: newSnapshot, release },
          ...stack.slice(pointer + 1),
        ];

        // Jump to the new snapshot.
        gotoSnapshot(newSnapshot);

        // Release the old snapshot so it can be garbage collected.
        releaseOldSnapshot();

        isDevelopment && dumpHistoryStateToConsole({ stack, pointer });

        // Return the new world for the reducer to update the state.
        return { stack, pointer };
      },
    []
  );
}
