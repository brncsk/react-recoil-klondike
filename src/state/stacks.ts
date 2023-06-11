import { atomFamily, selector } from "recoil";
import { Card, Rect, Stack } from "../types";

/** Stores the cards in a stack. */
export const stackCardsState = atomFamily<Card[], Stack>({
  key: "stack",
  default: [],
});

/** Stores the position of a stack. */
export const stackRectState = atomFamily<Rect, Stack>({
  key: "stack-rect",
  default: { x: 0, y: 0, width: 0, height: 0 },
});

/**
 * Returns whether the positions of the stacks have been initialized.
 * (e.g. the stacks' resize observers have been called at least once)
 */
export const stackPositionsHaveBeenInitializedState = selector<boolean>({
  key: "stack-positions-have-been-initialized",
  get: ({ get }) => get(stackRectState("deck")).width > 0,
});
