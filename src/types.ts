import type { Snapshot } from "recoil";

export enum Suit {
  Clubs = "♣",
  Diamonds = "♦",
  Hearts = "♥",
  Spades = "♠",
}

export enum Rank {
  Ace = "A",
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
}

export type Card = `${Rank}${Suit}`;

export type StackType = "deck" | "waste" | "foundation" | "tableau";

export type Stack =
  | "deck"
  | "waste"
  | `foundation-${number}`
  | `tableau-${number}`;

export interface CardDragInfo {
  /** The number of cards being dragged. */
  type: "single" | "multiple";

  /** The bottommost card being dragged. */
  card: Card;

  /** The stack that the card(s) are being dragged from. */
  sourceStack: Stack;
}

export type CanDrop = (
  dragInfo: CardDragInfo,
  topmostCard: Card | null
) => boolean;

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type StackDragEventType =
  | "stack-drag-enter"
  | "stack-drag-leave"
  | "stack-drop";

export type HistoryStack = Array<{ snapshot: Snapshot; release: () => void }>;
export type HistoryState = { stack: HistoryStack; pointer: number };
export type HistoryAction =
  | {
      type: "undo" | "redo" | "reset";
    }
  | {
      type: "push";
      snapshot: Snapshot;
    };

export interface HistoryContextType {
  undo: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: boolean;
  canRedo: boolean;
}
