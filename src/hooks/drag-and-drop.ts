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

/** Returns drag and drop listeners that can be attached to the board. */
export function useBoardDragAndDropListeners() {
  /** A drag's initial offset relative to the viewport. */
  const initialOffset = useRef({ x: 0, y: 0 });

  /** A drag's initial offset relative to the card. */
  const cardOffset = useRef({ x: 0, y: 0 });

  /** A `CardDragInfo` object representing the details of the current drag. */
  const dragInfo = useRef<CardDragInfo | null>(null);

  /** An array of the HTML elements of the cards being dragged. */
  const draggedCards = useRef<HTMLDivElement[]>([]);

  /** Whether the user has moved the mouse since the pointer down event. */
  const didMove = useRef(false);

  /** The HTML element of the stack that the user is currently dragging over. */
  const activeStack = useRef<HTMLDivElement | null>(null);

  /** The size of a card. */
  const cardSize = useRecoilValue(cardSizeState);

  const getLargestOverlappingStack = useGetLargestOverlappingStack();
  const boardElement = document.querySelector(".board")! as HTMLDivElement;

  /** Handles pointer move events. */
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      // Bail early if it's the last pointer event before a pointer up event
      // or if there's no drag info.
      if ((e.clientX === 0 && e.clientY === 0) || !dragInfo.current) {
        return;
      }

      // 1. Handle a drag start.
      if (!didMove.current) {
        didMove.current = true;

        // Add the dragged class to the cards being dragged.
        for (const card of draggedCards.current) {
          card.classList.add("dragged");
        }

        // Dispatch a stack drag start event.
        boardElement.dispatchEvent(
          new StackDragEvent("stack-drag-start", dragInfo.current!)
        );
      }

      // 2. Handle a drag move.
      const currentOffset = {
        x: e.clientX - initialOffset.current.x,
        y: e.clientY - initialOffset.current.y,
      };

      // Update the position of the cards being dragged.
      for (const card of draggedCards.current) {
        card.style.setProperty("--drag-offset-x", `${currentOffset.x}px`);
        card.style.setProperty("--drag-offset-y", `${currentOffset.y}px`);
      }

      // 3. Fetch the largest overlapping stack and dispatch the appropriate
      // events.
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

      // Handle the case where the user is not dragging over a stack.
      if (!stack) {
        // If there was an active stack, dispatch a stack drag leave event.
        if (activeStack.current && dragInfo.current) {
          activeStack.current.dispatchEvent(
            new StackDragEvent("stack-drag-leave", dragInfo.current)
          );
        }

        activeStack.current = null;
        return;
      }

      // Handle the case where the user is dragging over a stack.
      if (dragInfo.current) {
        // If there's a new active stack, dispatch a stack drag enter event.
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

  /** Handles pointer down events. */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const dragProps = getDragPropsFromEvent(e);

      // Bail early if the pointer down was not initiated on a card.
      if (!dragProps) {
        return;
      }

      // Initialize state variables.
      draggedCards.current = dragProps.draggedCards;
      dragInfo.current = dragProps.dragInfo;
      initialOffset.current = { x: e.clientX, y: e.clientY };
      cardOffset.current = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };

      // Attach a pointer move event listener (removed on pointer up).
      document.addEventListener("pointermove", handlePointerMove);
    },
    [draggedCards, dragInfo, initialOffset, handlePointerMove]
  );

  /** Handles pointer up events. */
  const handlePointerUp = useCallback(() => {
    // Remove the pointer move event listener.
    document.removeEventListener("pointermove", handlePointerMove);

    // Dispatch drop & drag end events on the active stack (if there is one).
    if (activeStack.current && didMove.current && dragInfo.current) {
      activeStack.current.dispatchEvent(
        new StackDragEvent("stack-drop", dragInfo.current)
      );

      boardElement.dispatchEvent(
        new StackDragEvent("stack-drag-end", dragInfo.current)
      );
    }

    // Remove drag-related styles from the cards being dragged.
    for (const card of draggedCards.current) {
      card.style.removeProperty("--drag-offset-x");
      card.style.removeProperty("--drag-offset-y");
      card.classList.remove("dragged");
    }

    // Reset state variables.
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

/**
 * Returns drag and drop listeners for a stack.
 * Handlers handle adding/removing the `drop-target` and `drag-over` classes
 * by handling our custom `stack-drag-start` and `stack-drag-end` events,
 * and initiating a card move when a `stack-drop` event is dispatched.
 *
 * NOTE: Listeners are attached using `addEventListener` instead of React
 * event handlers both because we're dealing with custom events and because
 * some of the handlers need to be attached to the board's element.
 */
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

  /** Memoize stacks' rects. */
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

        // Compute x and y overlap respectively
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
