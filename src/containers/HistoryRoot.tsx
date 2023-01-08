import { useReducer, useRef } from "react";
import {
  useGotoRecoilSnapshot,
  useRecoilTransactionObserver_UNSTABLE,
} from "recoil";

import { useHistoryShortcutListeners } from "../hooks/history";
import { HistoryState, HistoryAction } from "../types";
import {
  HistoryContext,
  isSnapshotToBeRetained,
  pushHistoryFrame,
} from "../util/history";

export function HistoryRoot({ children }: { children: React.ReactNode }) {
  const isUndoInProgress = useRef(false);
  const gotoRecoilSnapshot = useGotoRecoilSnapshot();

  const [{ stack, pointer }, historyDispatch] = useReducer(
    ({ stack, pointer }: HistoryState, action: HistoryAction) => {
      switch (action.type) {
        case "undo":
          if (pointer === stack.length - 1) {
            return { stack, pointer };
          }

          isUndoInProgress.current = true;

          gotoRecoilSnapshot(stack[pointer + 1].snapshot);
          return { stack, pointer: pointer + 1 };

        case "redo":
          if (pointer === 0) {
            return { stack, pointer };
          }

          isUndoInProgress.current = true;

          gotoRecoilSnapshot(stack[pointer - 1].snapshot);
          return { stack, pointer: pointer - 1 };

        case "push":
          return pushHistoryFrame({ stack, pointer }, action.snapshot);

        case "reset":
          return { stack: [], pointer: 0 };

        default:
          return { stack, pointer };
      }
    },
    { stack: [], pointer: 0 }
  );

  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    if (isUndoInProgress.current) {
      isUndoInProgress.current = false;
      return;
    }

    if (isSnapshotToBeRetained(snapshot)) {
      historyDispatch({ type: "push", snapshot });
    }
  });

  useHistoryShortcutListeners(historyDispatch);

  return (
    <HistoryContext.Provider
      value={{
        undo: () => historyDispatch({ type: "undo" }),
        redo: () => historyDispatch({ type: "redo" }),
        reset: () => historyDispatch({ type: "reset" }),
        canUndo: pointer < stack.length - 1,
        canRedo: pointer > 0,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}
