import { Card, Rank, Suit } from "../types";

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

export function getCardStyles({
  position,
  faceUp,
  dragged,
  zIndex,
}: {
  position: { x: number; y: number };
  faceUp: boolean;
  dragged: boolean;
  zIndex: number;
}): React.CSSProperties {
  return {
    transform: [
      `translate(${position.x}px, ${position.y}px)`,
      `rotateY(${faceUp ? 0 : 180}deg)`,
      `${dragged ? "scale(1.05)" : ""}`,
    ].join(" "),
    zIndex,
  };
}
