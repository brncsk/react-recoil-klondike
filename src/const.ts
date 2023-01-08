import { Suit, Rank } from "./types";

export const NUM_TABLEAU_STACKS = 7;
export const NUM_FOUNDATION_STACKS = Object.keys(Suit).length;
export const NUM_CARDS_PER_SUIT = Object.keys(Rank).length;

export const TABLEAU_FANOUT_OFFSET_FACE_DOWN_RATIO = 10;
export const TABLEAU_FANOUT_OFFSET_FACE_UP_RATIO = 5;
