import React, { useCallback, useEffect, useRef } from "react";
import clsx from "clsx";

import { CanDrop, CardDragInfo, Stack } from "../types";
import { useStackDropListeners } from "./drag-and-drop";
import { debounce, getStackType } from "../util";
import { useRecoilState } from "recoil";
import { stackPositionState } from "../state/stacks";

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
