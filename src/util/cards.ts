import { Card, Rank, Stack, Suit } from "../types";
import { getStackNumber, getStackType } from "./stacks";

export function getCardColor(card: Card): "red" | "black" {
  const suit = card.slice(-1);
  return suit === Suit.Hearts || suit === Suit.Diamonds ? "red" : "black";
}

export function getCardRank(card: Card): Rank {
  return card.slice(0, -1) as Rank;
}

export function getCardRankIndex(card: Card): number {
  return Object.values(Rank).indexOf(getCardRank(card));
}

export function getCardSuit(card: Card): Suit {
  return card.slice(-1) as Suit;
}

export function getCardZIndex(stack: Stack, cardIndex: number): number {
  let stackZIndex = 0;

  switch (getStackType(stack)) {
    case "deck":
      stackZIndex = 10;
      break;
    case "waste":
      stackZIndex = 20;
      break;
    case "tableau":
      stackZIndex = 30 + getStackNumber(stack);
      break;
    case "foundation":
      stackZIndex = 40 + getStackNumber(stack);
      break;
  }

  return cardIndex + stackZIndex * 100;
}
