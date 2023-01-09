import { useReducer, useRef } from "react";
import {
  useRecoilTransactionObserver_UNSTABLE,
  useSetRecoilState,
} from "recoil";

import {
  useHistoryShortcutListeners,
  useMapHistoryFrameOntoCurrentSnapshot,
} from "../hooks/history";
import { gameStartedState } from "../state/game";
import { HistoryState, HistoryAction } from "../types";
import {
  HistoryContext,
  isSnapshotToBeRetained,
  pushHistoryFrame,
} from "../util/history";

export function HistoryRoot({ children }: { children: React.ReactNode }) {
  const setGameStarted = useSetRecoilState(gameStartedState);
  const isUndoInProgress = useRef(false);

  const mapHistoryFrame = useMapHistoryFrameOntoCurrentSnapshot();

  const [{ stack, pointer }, historyDispatch] = useReducer(
    ({ stack, pointer }: HistoryState, action: HistoryAction) => {
      switch (action.type) {
        case "undo":
          if (pointer === stack.length - 1) {
            return { stack, pointer };
          }

          isUndoInProgress.current = true;
          return mapHistoryFrame({ stack, pointer: pointer + 1 });

        case "redo":
          if (pointer === 0) {
            return { stack, pointer };
          }

          isUndoInProgress.current = true;
          return mapHistoryFrame({ stack, pointer: pointer - 1 });

        case "push":
          setGameStarted(true);
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
