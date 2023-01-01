import { Card, Suit, Rank, StackType as stack, Stack } from "./types";

export function generateDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(Rank)) {
      deck.push(`${rank}${suit}` as Card);
    }
  }

  return deck.sort(() => Math.random() - 0.5);
}

export function getStackType(stack: Stack): stack {
  if (stack === "deck") {
    return "deck";
  } else if (stack === "waste") {
    return "waste";
  } else if (stack.startsWith("foundation-")) {
    return "foundation";
  } else {
    return "tableau";
  }
}

export function getStackNumber(stack: Stack): number {
  if (stack === "deck" || stack === "waste") {
    return 0;
  } else if (stack.startsWith("foundation-")) {
    return parseInt(stack.slice("foundation-".length), 10);
  } else {
    return parseInt(stack.slice("tableau-".length), 10);
  }
}

export function getStackGridColumn(stack: Stack): number {
  if (stack === "deck") {
    return 1;
  } else if (stack === "waste") {
    return 2;
  } else if (stack.startsWith("foundation-")) {
    return 3 + getStackNumber(stack);
  } else {
    return getStackNumber(stack);
  }
}

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

export function tableauStack(num: number): Stack {
  return `tableau-${num}` as Stack;
}

export function foundationStack(num: number): Stack {
  return `foundation-${num}` as Stack;
}
