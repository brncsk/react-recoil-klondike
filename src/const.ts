import { Suit, Rank, Stack } from "./types";
import { foundationStack, tableauStack } from "./util/stacks";

/** The number of tableau stacks. */
export const NUM_TABLEAU_STACKS = 7;
/** The number of foundation stacks (one for each suit). */
export const NUM_FOUNDATION_STACKS = Object.keys(Suit).length;
/** The number of cards per suit. */
export const NUM_CARDS_PER_SUIT = Object.keys(Rank).length;

/**
 * The fraction of a card's height to offset a card by when it is face down
 * in a tableau stack. (This is the optimal case, might be lower if stack height
 * is too small.)
 */
export const TABLEAU_FANOUT_OFFSET_FACE_DOWN_FRACTION = 0.1;
/**
 * The fraction of a card's height to offset a card by when it is face up
 * in a tableau stack. (This is the optimal case, might be lower if stack height
 * is too small.)
 */
export const TABLEAU_FANOUT_OFFSET_FACE_UP_FRACTION = 0.2;
/**
 * The fraction of a card's size to offset a card by when drawing the faux-3d
 * effect for deck/waste/foundation stacks.
 */
export const DECK_WASTE_FANOUT_OFFSET_RATIO = 1000;

/**
 * The number of milliseconds to wait between each move when finishing a game.
 */
export const TRIVIAL_AUTOMOVE_INTERVAL_MS = 250;

/**
 * A list of all the stacks in the game (handy for iterating over them, e.g.
 * when generating the list of atoms to track in history).
 */
export const STACKS: Stack[] = [
  "deck",
  "waste",
  ...[...Array(NUM_FOUNDATION_STACKS)].map((_, i) => foundationStack(i)),
  ...[...Array(NUM_TABLEAU_STACKS)].map((_, i) => tableauStack(i)),
];
