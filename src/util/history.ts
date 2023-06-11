import { createContext } from "react";
import { RecoilState, RecoilValue, Snapshot } from "recoil";

import { NUM_TABLEAU_STACKS, STACKS } from "../const";
import {
  cardIsFaceUpState,
  cardStackIndexState,
  cardStackState,
  stackNumFaceUpCardsState,
  tableauNumFaceUpCardsState,
} from "../state/cards";
import { stackCardsState } from "../state/stacks";

import { HistoryContextType, HistoryState } from "../types";
import { generateDeck } from "./deck";

export const HistoryContext = createContext<HistoryContextType>({
  undo: () => {},
  redo: () => {},
  reset: () => {},
  restart: () => {},
  canUndo: false,
  canRedo: false,
  canRestart: false,
});

/** Atoms that are tracked throughout the game. */
export const TRACKED_ATOMS: RecoilState<any>[] = [
  ...STACKS.map(stackCardsState),
  ...Array(NUM_TABLEAU_STACKS)
    .fill(undefined)
    .map((_, i) => tableauNumFaceUpCardsState(i)),
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
  let hasTrackedNodes = false;

  for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
    if (isNodeTracked(node)) {
      hasTrackedNodes = true;
      break;
    }
  }

  return hasTrackedNodes;
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

  const newState = {
    stack: [{ snapshot, release }, ...state.stack],
    pointer: 0,
  };

  return newState;
}

/** Dumps the modified contents of a snapshot to the console. */
export function dumpSnapshotToConsole(snapshot: Snapshot) {
  console.group(`Snapshot ${snapshot.getID()} at ${Date()}`);

  console.groupCollapsed("Modified nodes");

  for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
    const loadable = snapshot.getLoadable(node);
    if (loadable.state === "hasValue") console.log(node.key, loadable.contents);
  }

  console.groupEnd();

  console.groupCollapsed("Game state");

  for (const stack of STACKS) {
    const cards = snapshot.getLoadable(stackCardsState(stack)).valueMaybe();
    const numCards = cards?.length;
    const numFaceUpCards = snapshot
      .getLoadable(stackNumFaceUpCardsState(stack))
      .valueMaybe();

    const cardsWithIndices = cards?.map((card, i) => {
      const isFaceUp = snapshot
        .getLoadable(cardIsFaceUpState(card))
        .valueMaybe();
      const stackIndex = snapshot
        .getLoadable(cardStackIndexState(card))
        .valueMaybe();

      return `${card} (${isFaceUp ? "up" : "dn"}, ${stackIndex})`;
    });

    console.groupCollapsed(
      `${stack} (${numCards} cards, ${numFaceUpCards} face up)`
    );
    cardsWithIndices?.forEach((card) => console.log(card));
    console.groupEnd();
  }

  console.groupEnd();

  console.groupEnd();
}

export function dumpHistoryStateToConsole(state: HistoryState) {
  console.groupCollapsed(`History state at ${Date()}`);
  console.log(
    `${state.stack.length} snapshots in stack, pointer at ${state.pointer}`
  );

  for (const [index, { snapshot }] of state.stack.entries()) {
    console.log(
      [
        index === state.pointer ? ">" : " ",
        `[${index.toString().padStart(3, " ")}]`,
        snapshot.getID(),
        `(retained: ${snapshot.isRetained() ? "yes" : "no"})`,
      ].join(" ")
    );
  }

  console.groupEnd();
}

export function assertSnapshotIsRetained(snapshot: Snapshot) {
  if (!snapshot.isRetained()) {
    throw new Error(
      `Snapshot ${snapshot.getID()} is not retained, but should be.`
    );
  }
}
