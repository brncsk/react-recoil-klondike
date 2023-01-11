import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { RecoilValueReadOnly, useRecoilSnapshot, useRecoilValue } from "recoil";

import {
  CanDrop,
  Card,
  CardDragInfo,
  Rect,
  Stack,
  StackDragEventType,
} from "../types";

import { getDragPropsFromEvent, getDragRect } from "../util/drag-and-drop";
import { StackDragEvent } from "../util/stack-drag-event";
import { cardSizeState } from "../state/cards";

import { useMoveCard } from "./game";

export function useBoardDragAndDropListeners() {
  const initialOffset = useRef({ x: 0, y: 0 });
  const cardOffset = useRef({ x: 0, y: 0 });
  const dragInfo = useRef<CardDragInfo | null>(null);
  const draggedCards = useRef<HTMLDivElement[]>([]);
  const didMove = useRef(false);
  const activeStack = useRef<HTMLDivElement | null>(null);
  const cardSize = useRecoilValue(cardSizeState);

  const getLargestOverlappingStack = useGetLargestOverlappingStack();
  const boardElement = document.querySelector(".board")! as HTMLDivElement;

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (e.clientX === 0 && e.clientY === 0) {
        return;
      }

      if (!didMove.current) {
        didMove.current = true;

        for (const card of draggedCards.current) {
          card.classList.add("dragged");
        }

        boardElement.dispatchEvent(
          new StackDragEvent("stack-drag-start", dragInfo.current!)
        );
      }

      const currentOffset = {
        x: e.clientX - initialOffset.current.x,
        y: e.clientY - initialOffset.current.y,
      };

      for (const card of draggedCards.current) {
        card.style.setProperty("--drag-offset-x", `${currentOffset.x}px`);
        card.style.setProperty("--drag-offset-y", `${currentOffset.y}px`);
      }

      const stack = getLargestOverlappingStack(
        getDragRect({
          cardSize,
          currentOffset,
          initialOffset: initialOffset.current,
          cardOffset: cardOffset.current,
          numCards: draggedCards.current.length,
        })
      );

      const stackElement = document.getElementById(
        `stack-${stack}`
      )! as HTMLDivElement;

      if (!stack) {
        if (activeStack.current && dragInfo.current) {
          activeStack.current.dispatchEvent(
            new StackDragEvent("stack-drag-leave", dragInfo.current)
          );
        }

        activeStack.current = null;
        return;
      }

      if (dragInfo.current) {
        if (activeStack.current) {
          if (activeStack.current.dataset.stack === stack) {
            return;
          }

          activeStack.current.dispatchEvent(
            new StackDragEvent("stack-drag-leave", dragInfo.current)
          );
        }

        activeStack.current = stackElement;
        activeStack.current.dispatchEvent(
          new StackDragEvent("stack-drag-enter", dragInfo.current)
        );
      }
    },
    [
      boardElement,
      initialOffset,
      draggedCards,
      didMove,
      activeStack,
      dragInfo,
      getLargestOverlappingStack,
      cardSize,
    ]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const dragProps = getDragPropsFromEvent(e);

      if (!dragProps) {
        return;
      }

      draggedCards.current = dragProps.draggedCards;
      dragInfo.current = dragProps.dragInfo;
      initialOffset.current = { x: e.clientX, y: e.clientY };
      cardOffset.current = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };

      document.addEventListener("pointermove", handlePointerMove);
    },
    [draggedCards, dragInfo, initialOffset, handlePointerMove]
  );

  const handlePointerUp = useCallback(() => {
    document.removeEventListener("pointermove", handlePointerMove);

    if (activeStack.current && didMove.current && dragInfo.current) {
      activeStack.current.dispatchEvent(
        new StackDragEvent("stack-drop", dragInfo.current)
      );

      boardElement.dispatchEvent(
        new StackDragEvent("stack-drag-end", dragInfo.current)
      );
    }

    for (const card of draggedCards.current) {
      card.style.removeProperty("--drag-offset-x");
      card.style.removeProperty("--drag-offset-y");
      card.classList.remove("dragged");
    }

    draggedCards.current = [];
    dragInfo.current = null;
    didMove.current = false;

    initialOffset.current = { x: 0, y: 0 };
    cardOffset.current = { x: 0, y: 0 };
  }, [draggedCards, handlePointerMove, boardElement]);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
  } as React.HTMLAttributes<HTMLDivElement>;
}

export function useStackDragAndDropListeners({
  stack,
  stackElement,
  topmostCard,
  canDrop,
}: {
  stack: Stack;
  stackElement: HTMLDivElement | null;
  topmostCard: Card | null;
  canDrop: CanDrop;
}) {
  const moveCard = useMoveCard();
  const boardElement = document.querySelector(".board")! as HTMLDivElement;

  const handleStackDragStart = useCallback(
    (e: StackDragEvent) => {
      if (canDrop(e.detail, topmostCard)) {
        stackElement?.classList.add("drop-target");
      }
    },
    [canDrop, topmostCard, stackElement]
  );

  const handleStackDragEnd = useCallback(() => {
    stackElement?.classList.remove("drop-target");
  }, [stackElement]);

  const handleStackDragEnter = useCallback(
    () => stackElement?.classList.add("drag-over"),
    [stackElement]
  );

  const handleStackDragLeave = useCallback(() => {
    stackElement?.classList.remove("drag-over");
  }, [stackElement]);

  const handleDrop = useCallback(
    (e: StackDragEvent) => {
      if (canDrop(e.detail, topmostCard) && e.detail.sourceStack !== stack) {
        moveCard(e.detail.sourceStack, stack, e.detail.card);
      }
    },
    [canDrop, moveCard, stack, topmostCard]
  );

  return useEffect(() => {
    if (!stackElement) {
      return;
    }

    boardElement.addEventListener("stack-drag-start", handleStackDragStart);
    boardElement.addEventListener("stack-drag-end", handleStackDragEnd);
    stackElement.addEventListener<StackDragEventType>(
      "stack-drag-enter",
      handleStackDragEnter
    );
    stackElement.addEventListener("stack-drag-leave", handleStackDragLeave);
    stackElement.addEventListener("stack-drop", handleDrop);
    stackElement.addEventListener("stack-drop", handleStackDragLeave);

    return () => {
      boardElement.removeEventListener(
        "stack-drag-start",
        handleStackDragStart
      );
      boardElement.removeEventListener("stack-drag-end", handleStackDragEnd);

      stackElement.removeEventListener(
        "stack-drag-enter",
        handleStackDragEnter
      );
      stackElement.removeEventListener(
        "stack-drag-leave",
        handleStackDragLeave
      );

      stackElement.removeEventListener("stack-drop", handleDrop);
      stackElement.removeEventListener("stack-drop", handleStackDragLeave);
    };
  }, [
    boardElement,
    stackElement,
    handleStackDragStart,
    handleStackDragEnd,
    handleStackDragEnter,
    handleStackDragLeave,
    handleDrop,
  ]);
}

/** Returns the stack that the given rect overlaps the most. */
function useGetLargestOverlappingStack() {
  const snapshot = useRecoilSnapshot();

  const stackRects = useMemo<Record<Stack, Rect>>(() => {
    let stackRects: Partial<Record<Stack, Rect>> = {};

    for (const node of snapshot.getNodes_UNSTABLE()) {
      if (node.key.startsWith("stack-rect__")) {
        const stack = JSON.parse(node.key.replace("stack-rect__", "")) as Stack;
        const rect = snapshot
          .getLoadable(node as RecoilValueReadOnly<Rect>)
          .valueOrThrow();

        stackRects[stack] = rect;
      }
    }

    return stackRects as Record<Stack, Rect>;
  }, [snapshot]);

  return useCallback(
    (rect: Rect) => {
      let largestStack: Stack | null = null;
      let largestArea = 0;

      for (const [stack, stackRect] of Object.entries(stackRects)) {
        // Bail early if the stack is not a valid drop target
        if (!document.querySelector(`#stack-${stack}.drop-target`)) {
          continue;
        }

        // Bail early if the rects don't overlap
        if (
          stackRect.x > rect.x + rect.width ||
          stackRect.y > rect.y + rect.height ||
          stackRect.x + stackRect.width < rect.x ||
          stackRect.y + stackRect.height < rect.y
        ) {
          continue;
        }

        const xOverlap = Math.max(
          0,
          Math.min(rect.x + rect.width, stackRect.x + stackRect.width) -
            Math.max(rect.x, stackRect.x)
        );
        const yOverlap = Math.max(
          0,
          Math.min(rect.y + rect.height, stackRect.y + stackRect.height) -
            Math.max(rect.y, stackRect.y)
        );

        const area = xOverlap * yOverlap;

        if (area > largestArea) {
          largestStack = stack as Stack;
          largestArea = area;
        }
      }

      return largestStack;
    },
    [stackRects]
  );
}
