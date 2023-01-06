import { atomFamily } from "recoil";
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
