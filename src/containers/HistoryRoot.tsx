import { useReducer, useRef } from "react";
import {
  useRecoilTransactionObserver_UNSTABLE,
  useSetRecoilState,
} from "recoil";

import { HistoryState, HistoryAction } from "../types";
import { gameStartedState } from "../state/game";

import { isDevelopment } from "../util/env";
import {
  HistoryContext,
  dumpHistoryStateToConsole,
  isSnapshotToBeRetained,
  pushHistoryFrame,
} from "../util/history";
import {
  useHistoryShortcutListeners,
  useMapHistoryFrameOntoCurrentSnapshot,
} from "../hooks/history";

export function HistoryRoot({ children }: { children: React.ReactNode }) {
  const setGameStarted = useSetRecoilState(gameStartedState);
  const isUndoInProgress = useRef(false);

  const mapHistoryFrame = useMapHistoryFrameOntoCurrentSnapshot();

  const [{ stack, pointer }, historyDispatch] = useReducer(
    ({ stack, pointer }: HistoryState, action: HistoryAction) => {
      let newState = { stack, pointer };

      switch (action.type) {
        case "undo":
          if (pointer < stack.length - 1) {
            isUndoInProgress.current = true;
            newState = mapHistoryFrame({ stack, pointer: pointer + 1 });
          }
          break;

        case "redo":
          if (pointer > 0) {
            isUndoInProgress.current = true;
            newState = mapHistoryFrame({ stack, pointer: pointer - 1 });
          }
          break;

        case "push":
          setGameStarted(true);
          newState = pushHistoryFrame(newState, action.snapshot);
          break;

        case "reset":
          newState = { stack: [], pointer: 0 };
          break;

        case "restart":
          isUndoInProgress.current = true;
          newState = mapHistoryFrame({
            stack: [stack[stack.length - 1]],
            pointer: 0,
          });
          break;
      }

      if (isDevelopment) {
        console.log("historyDispatch", action);
        dumpHistoryStateToConsole({ stack, pointer });
      }

      return newState;
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
        restart: () => historyDispatch({ type: "restart" }),
        canUndo: pointer < stack.length - 1,
        canRedo: pointer > 0,
        canRestart: stack.length > 1,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}
