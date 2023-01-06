import { atomFamily } from "recoil";
import { Card, Stack } from "../types";

/** Stores the cards in a stack. */
export const stackCardsState = atomFamily<Card[], Stack>({
  key: "stack",
  default: [],
});

/** Stores the position of a stack. */
export const stackRectState = atomFamily<
  { x: number; y: number; width: number; height: number },
  Stack
>({
  key: "stack-position",
  default: { x: 0, y: 0, width: 0, height: 0 },
});
