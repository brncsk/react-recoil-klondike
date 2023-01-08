import { useCallback, useEffect, useMemo, useRef } from "react";
import { RecoilValueReadOnly, useRecoilSnapshot, useRecoilValue } from "recoil";

import { CanDrop, Card, CardDragInfo, Rect, Stack } from "../types";

import { useMoveCard } from "./game";
import {
  dispatchStackDragEvent,
  getDragPropsFromEvent,
  getDragRect,
} from "../util/drag-and-drop";
import { cardSizeState } from "../state/cards";

export function useBoardEventListeners() {
  const initialOffset = useRef({ x: 0, y: 0 });
  const cardOffset = useRef({ x: 0, y: 0 });
  const dragInfo = useRef<CardDragInfo | null>(null);
  const draggedCards = useRef<HTMLDivElement[]>([]);
  const didMove = useRef(false);
  const activeStack = useRef<HTMLDivElement | null>(null);
  const cardSize = useRecoilValue(cardSizeState);

  const getLargestOverlappingStack = useGetLargestOverlappingStack();

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (e.clientX === 0 && e.clientY === 0) {
        return;
      }

      if (!didMove.current) {
        didMove.current = true;

        for (const card of draggedCards.current) {
          card.classList.add("dragged");
        }
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
        return;
      }

      if (dragInfo.current) {
        if (activeStack.current) {
          if (activeStack.current.dataset.stack === stack) {
            return;
          }

          dispatchStackDragEvent(
            "stack-drag-leave",
            dragInfo.current,
            activeStack.current
          );
        }

        activeStack.current = stackElement;

        dispatchStackDragEvent(
          "stack-drag-enter",
          dragInfo.current,
          activeStack.current
        );
      }
    },
    [
      initialOffset,
      draggedCards,
      didMove,
      activeStack,
      dragInfo,
      getLargestOverlappingStack,
      cardSize,
    ]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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

      document.addEventListener("mousemove", handleMouseMove);
    },
    [draggedCards, dragInfo, initialOffset, handleMouseMove]
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);

    if (activeStack.current && didMove.current && dragInfo.current) {
      dispatchStackDragEvent(
        "stack-drop",
        dragInfo.current,
        activeStack.current
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
  }, [draggedCards, handleMouseMove]);

  return {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
  } as React.HTMLAttributes<HTMLDivElement>;
}

export function useStackDropListeners({
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

  const handleStackDragEnter = useCallback(
    (e: CustomEvent<CardDragInfo>) => {
      if (stackElement && canDrop(e.detail, topmostCard)) {
        stackElement.classList.add("drop-target");
      }
    },
    [canDrop, topmostCard, stackElement]
  );

  const handleStackDragLeave = useCallback(() => {
    if (stackElement) {
      stackElement.classList.remove("drop-target");
    }
  }, [stackElement]);

  const handleDrop = useCallback(
    (e: CustomEvent<CardDragInfo>) => {
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

    stackElement.addEventListener(
      "stack-drag-enter" as any,
      handleStackDragEnter
    );
    stackElement.addEventListener(
      "stack-drag-leave" as any,
      handleStackDragLeave
    );
    stackElement.addEventListener("stack-drop" as any, handleDrop);
    stackElement.addEventListener("stack-drop" as any, handleStackDragLeave);

    return () => {
      stackElement.removeEventListener(
        "drag-enter-stack" as any,
        handleStackDragEnter
      );
      stackElement.removeEventListener(
        "drag-leave-stack" as any,
        handleStackDragLeave
      );
      stackElement.removeEventListener("stack-drop" as any, handleDrop);
      stackElement.removeEventListener(
        "stack-drop" as any,
        handleStackDragLeave
      );
    };
  }, [handleStackDragEnter, handleStackDragLeave, handleDrop, stackElement]);
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
