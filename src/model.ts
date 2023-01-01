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

export const NUM_TABLEAU_STACKS = 7;
export const NUM_FOUNDATION_STACKS = Object.keys(Suit).length;

export interface CardDragInfo {
  type: "single" | "multiple";
  card: Card;
  sourceStack: Stack;
}
