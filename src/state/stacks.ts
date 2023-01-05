import { atomFamily } from "recoil";
import { Card, Stack } from "../types";

/** Stores the cards in a stack. */
export const stackCardsState = atomFamily<Card[], Stack>({
  key: "stack",
  default: [],
});

/** Stores the position of a stack. */
export const stackPositionState = atomFamily<{ x: number; y: number }, Stack>({
  key: "stack-position",
  default: { x: 0, y: 0 },
});
