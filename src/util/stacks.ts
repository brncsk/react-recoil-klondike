import {
  TABLEAU_FANOUT_OFFSET_FACE_UP_RATIO,
  TABLEAU_FANOUT_OFFSET_FACE_DOWN_RATIO,
} from "../const";
import { Stack, StackType } from "../types";

export function getStackType(stack: Stack): StackType {
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

export function tableauStack(num: number): Stack {
  return `tableau-${num}` as Stack;
}

export function foundationStack(num: number): Stack {
  return `foundation-${num}` as Stack;
}

export function getTableauFanoutOffset(
  cardHeight: number,
  numCards: number,
  numFaceUpCards: number,
  index: number
): number {
  const numFaceDownCards = numCards - numFaceUpCards;
  const isFaceUp = index >= numFaceDownCards;

  if (isFaceUp) {
    return (
      (cardHeight / TABLEAU_FANOUT_OFFSET_FACE_UP_RATIO) *
        (index - numFaceDownCards) +
      (cardHeight / TABLEAU_FANOUT_OFFSET_FACE_DOWN_RATIO) * numFaceDownCards
    );
  } else {
    return (cardHeight / TABLEAU_FANOUT_OFFSET_FACE_DOWN_RATIO) * index;
  }
}
