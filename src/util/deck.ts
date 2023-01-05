import { Card, Suit, Rank } from "../types";

const deck: Card[] = [];

export function generateDeck(): Card[] {
  if (deck.length === 0) {
    for (const suit of Object.values(Suit)) {
      for (const rank of Object.values(Rank)) {
        deck.push(`${rank}${suit}` as Card);
      }
    }
  }

  return [...deck];
}

export function shuffleDeck(deck: Card[]): Card[] {
  return deck.sort(() => Math.random() - 0.5);
}
