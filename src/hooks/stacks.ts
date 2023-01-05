import React, { useCallback, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import clsx from "clsx";

import { CanDrop, Rank, Stack } from "../types";
import { useStackDropListeners } from "./drag-and-drop";
import { stackPositionState } from "../state/stacks";

import { getCardColor, getCardRank, getCardRankIndex } from "../util/cards";
import { debounce } from "../util/debounce";
import { getStackType } from "../util/stacks";

const STACK_REPOSITION_DEBOUNCE_TIMEOUT_MS = 500;

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
  const [{ isDropTarget }, dragProps] = useStackDropListeners({
    stack,
    canDrop,
  });

  return {
    ref: useDeckPositionObserver({ stack }),
    ...dragProps,
    onClick,
    style: { gridColumn },
    className: clsx("stack", getStackType(stack), stack, {
      "drop-target": isDropTarget,
    }),
  } as React.RefAttributes<HTMLDivElement>;
}

function useDeckPositionObserver({ stack }: { stack: Stack }) {
  const ref = useRef<HTMLDivElement>(null);

  const [stackPosition, setStackPosition] = useRecoilState(
    stackPositionState(stack)
  );

  const updatePosition = useCallback(() => {
    // Set the stack position so that we can use it to calculate the
    // position of the cards in the stack.

    if (!ref.current) {
      return;
    }

    const { x, y } = ref.current.getBoundingClientRect();

    if (stackPosition.x === x && stackPosition.y === y) {
      return;
    }

    setStackPosition({ x, y });
  }, [stackPosition, setStackPosition]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });

    resizeObserver.observe(document.body);
    debounce(updatePosition, STACK_REPOSITION_DEBOUNCE_TIMEOUT_MS);

    return () => resizeObserver.disconnect();
  }, [updatePosition]);

  return ref;
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
      getCardColor(dragInfo.card) === getCardColor(topmostCard)
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
