import { Suit, Rank, Stack } from "./types";
import { foundationStack, tableauStack } from "./util/stacks";

export const NUM_TABLEAU_STACKS = 7;
export const NUM_FOUNDATION_STACKS = Object.keys(Suit).length;
export const NUM_CARDS_PER_SUIT = Object.keys(Rank).length;

export const TABLEAU_FANOUT_OFFSET_FACE_DOWN_RATIO = 10;
export const TABLEAU_FANOUT_OFFSET_FACE_UP_RATIO = 5;

export const STACKS: Stack[] = [
  "deck",
  "waste",
  ...[...Array(NUM_FOUNDATION_STACKS)].map((_, i) => foundationStack(i)),
  ...[...Array(NUM_TABLEAU_STACKS)].map((_, i) => tableauStack(i)),
];
