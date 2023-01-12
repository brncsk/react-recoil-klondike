import {
  TABLEAU_FANOUT_OFFSET_FACE_UP_FRACTION,
  TABLEAU_FANOUT_OFFSET_FACE_DOWN_FRACTION,
  DECK_WASTE_FANOUT_OFFSET_RATIO,
  NUM_CARDS_PER_SUIT,
  NUM_TABLEAU_STACKS,
} from "../const";
import { Position, Size, Stack, StackType } from "../types";

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

export function getStackFanoutOffset({
  stackType,
  stackSize,
  cardHeight,
  numCards,
  numFaceUpCards,
  index,
}: {
  stackType: StackType;
  stackSize: Size;
  cardHeight: number;
  numCards: number;
  numFaceUpCards: number;
  index: number;
}): Position {
  switch (stackType) {
    case "tableau":
      const numFaceDownCards = numCards - numFaceUpCards;
      const isFaceUp = index >= numFaceDownCards;

      /** The max number of face down cards in the rightmost tableau stack. */
      const maxFaceDownCards = NUM_TABLEAU_STACKS - 1;
      /** The max number of face up cards in the rightmost tableau stack. */
      const maxFaceUpCards = NUM_CARDS_PER_SUIT - 1;
      /** The max cards in the rightmost tableau stack in the worst case. */
      const sumMaxCards = maxFaceDownCards + maxFaceUpCards;

      /** The max amount of space taken by face down cards in card-heights. */
      const faceDownSpaceFraction =
        TABLEAU_FANOUT_OFFSET_FACE_DOWN_FRACTION * maxFaceDownCards;

      /** The max amount of space taken by face up cards in card-heights. */
      const faceUpSpaceFraction =
        TABLEAU_FANOUT_OFFSET_FACE_UP_FRACTION * maxFaceUpCards;

      /**
       * The max space to distribute between fanouts is the height of the stack
       * minus the height of a single card.
       */
      const maxFanoutSpace = stackSize.height - cardHeight;

      // Calculate the actual fanout space for face down and face up cards.
      const fanoutFaceDown = Math.min(
        (faceDownSpaceFraction / sumMaxCards) * maxFanoutSpace,
        TABLEAU_FANOUT_OFFSET_FACE_DOWN_FRACTION * cardHeight
      );
      const fanoutFaceUp = Math.min(
        (faceUpSpaceFraction / sumMaxCards) * maxFanoutSpace,
        TABLEAU_FANOUT_OFFSET_FACE_UP_FRACTION * cardHeight
      );

      if (isFaceUp) {
        return {
          x: 0,
          y:
            fanoutFaceUp * (index - numFaceDownCards) +
            fanoutFaceDown * numFaceDownCards,
        };
      } else {
        return {
          x: 0,
          y: fanoutFaceDown * index,
        };
      }

    default:
      return {
        x: (index * -cardHeight) / DECK_WASTE_FANOUT_OFFSET_RATIO,
        y: (index * -cardHeight) / DECK_WASTE_FANOUT_OFFSET_RATIO,
      };
  }
}
