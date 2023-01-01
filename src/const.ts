import { Suit, Rank } from "./types";

export const NUM_TABLEAU_STACKS = 7;
export const NUM_FOUNDATION_STACKS = Object.keys(Suit).length;
export const NUM_CARDS_PER_SUIT = Object.keys(Rank).length;
