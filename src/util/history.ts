import { createContext } from "react";
import { Snapshot } from "recoil";

export type HistoryStack = Array<{ snapshot: Snapshot; release: () => void }>;
export type HistoryState = { stack: HistoryStack; pointer: number };
export type HistoryAction =
  | {
      type: "undo" | "redo" | "reset";
    }
  | {
      type: "push";
      snapshot: Snapshot;
    };

export interface HistoryContextType {
  undo: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const HistoryContext = createContext<HistoryContextType>({
  undo: () => {},
  redo: () => {},
  reset: () => {},
  canUndo: false,
  canRedo: false,
});

const RETAINABLE_NODE_PREFIXES = ["card-stack"];

/** Returns true if the snapshot contains any nodes that should be retained. */
export function isSnapshotToBeRetained(snapshot: Snapshot) {
  for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
    const retainable = RETAINABLE_NODE_PREFIXES.some((prefix) =>
      node.key.startsWith(prefix)
    );

    if (retainable) {
      return true;
    }
  }

  return false;
}

/** Pushes a snapshot onto the history stack. */
export function pushHistoryFrame(
  state: HistoryState,
  snapshot: Snapshot
): HistoryState {
  const release = snapshot.retain();

  // Invalidate the redo stack
  state.stack
    .splice(0, Math.min(state.pointer, state.stack.length - 1))
    .forEach(({ release }) => release());

  return {
    stack: [{ snapshot, release }, ...state.stack],
    pointer: 0,
  };
}
