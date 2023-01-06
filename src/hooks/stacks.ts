import React, { useCallback, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { CanDrop, Rank, Stack } from "../types";
import { stackRectState } from "../state/stacks";
import { topmostCardState } from "../state/cards";

import {
  getCardColor,
  getCardRank,
  getCardRankIndex,
  getCardSuit,
} from "../util/cards";
import { useStackDropListeners } from "./drag-and-drop";
import { useViewportSizeObserver } from "./viewport";

export function useStack({
  stack,
  gridColumn,
  canDrop,
  onClick,
}: {
  stack: Stack;
  gridColumn: React.CSSProperties["gridColumn"];
  canDrop: CanDrop;
  onClick?: () => void;
}) {
  const [stackElement, setStackElement] = useState<HTMLDivElement | null>(null);
  const topmostCard = useRecoilValue(topmostCardState(stack));

  useStackDropListeners({ stack, stackElement, topmostCard, canDrop });
  useStackPositionObserver({ stack, stackElement });

  return {
    ref: setStackElement,
    id: `stack-${stack}`,
    className: "stack",

    "data-stack": stack,
    "data-topmost-card": topmostCard,

    onClick,
    style: { gridColumn },
  } as React.RefAttributes<HTMLDivElement>;
}

function useStackPositionObserver({
  stack,
  stackElement,
}: {
  stack: Stack;
  stackElement: HTMLDivElement | null;
}) {
  const [stackRect, setStackRect] = useRecoilState(stackRectState(stack));

  useViewportSizeObserver(
    useCallback(() => {
      // Set the stack position so that we can use it to calculate the
      // position of the cards in the stack.

      console.log("useStackPositionObserver", stack, stackElement);

      if (!stackElement) {
        return;
      }

      const { x, y, width, height } = stackElement.getBoundingClientRect();

      console.log("x", x, "y", y, "width", width, "height", height);

      if (stackRect.x === x && stackRect.y === y) {
        return;
      }

      setStackRect({ x, y, width, height });
    }, [stackRect, setStackRect, stackElement])
  );
}

export const canDropOntoFoundation: CanDrop = (dragInfo, topmostCard) => {
  if (dragInfo.type === "multiple") {
    // Multiple cards can't be dropped on a foundation
    return false;
  }

  if (!topmostCard) {
    // Empty foundation, only aces can be dropped
    return getCardRank(dragInfo.card) === Rank.Ace;
  } else {
    // Non-empty stack, only cards of the same suit
    // and one rank higher can be dropped
    return (
      getCardRankIndex(dragInfo.card) === getCardRankIndex(topmostCard) + 1 &&
      getCardSuit(dragInfo.card) === getCardSuit(topmostCard)
    );
  }
};

export const canDropOntoTableau: CanDrop = (dragInfo, topmostCard) => {
  if (!topmostCard) {
    // Empty stack, only kings can be dropped
    return getCardRank(dragInfo.card) === Rank.King;
  } else {
    // Non-empty stack, only cards of the opposite color
    // and one rank lower can be dropped
    return (
      getCardRankIndex(dragInfo.card) === getCardRankIndex(topmostCard) - 1 &&
      getCardColor(dragInfo.card) !== getCardColor(topmostCard)
    );
  }
};
