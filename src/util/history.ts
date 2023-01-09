import { createContext } from "react";
import { RecoilState, RecoilValue, Snapshot } from "recoil";

import { STACKS } from "../const";
import { cardStackState } from "../state/cards";
import { stackCardsState } from "../state/stacks";

import { HistoryContextType, HistoryState } from "../types";
import { generateDeck } from "./deck";
import { isDevelopment } from "./env";

export const HistoryContext = createContext<HistoryContextType>({
  undo: () => {},
  redo: () => {},
  reset: () => {},
  canUndo: false,
  canRedo: false,
});

/** Atoms that are tracked throughout the game. */
const TRACKED_ATOMS: RecoilState<any>[] = [
  ...STACKS.map(stackCardsState),
  ...generateDeck().map(cardStackState),
];

/** Keys of tracked atoms for fast lookup. */
const TRACKED_NODE_KEYS = new Set(TRACKED_ATOMS.map((atom) => atom.key));

/** Returns true if the node is tracked. */
export function isNodeTracked(node: RecoilValue<unknown>) {
  return TRACKED_NODE_KEYS.has(node.key);
}

/** Returns true if the snapshot contains any nodes that should be tracked. */
export function isSnapshotToBeRetained(snapshot: Snapshot) {
  isDevelopment && dumpSnapshotToConsole(snapshot);

  for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
    if (isNodeTracked(node)) {
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

/** Dumps the modified contents of a snapshot to the console. */
export function dumpSnapshotToConsole(snapshot: Snapshot) {
  console.groupCollapsed(`Snapshot ${snapshot.getID()} at ${Date()}`);

  for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
    const loadable = snapshot.getLoadable(node);
    if (loadable.state === "hasValue") console.log(node.key, loadable.contents);
  }

  console.groupEnd();
}
