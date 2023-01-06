import { useCallback, useEffect, useRef } from "react";

import { CanDrop, Card, CardDragInfo, Stack } from "../types";

import { useMoveCard } from "./game";
import {
  dispatchStackDragEvent,
  getDragPropsFromEvent,
  getStackFromEvent,
} from "../util/drag-and-drop";

export function useBoardEventListeners() {
  const initialOffset = useRef({ x: 0, y: 0 });
  const dragInfo = useRef<CardDragInfo | null>(null);
  const draggedCards = useRef<HTMLDivElement[]>([]);
  const didMove = useRef(false);
  const activeStack = useRef<HTMLDivElement | null>(null);

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

      for (const card of draggedCards.current) {
        card.style.setProperty(
          "--drag-offset-x",
          `${e.clientX - initialOffset.current.x}px`
        );
        card.style.setProperty(
          "--drag-offset-y",
          `${e.clientY - initialOffset.current.y}px`
        );
      }

      const stack = getStackFromEvent(e);

      if (!stack) {
        return;
      }

      if (dragInfo.current) {
        if (activeStack.current) {
          if (activeStack.current.dataset.stack === stack.stack) {
            return;
          }

          dispatchStackDragEvent(
            "stack-drag-leave",
            dragInfo.current,
            activeStack.current
          );
        }

        activeStack.current = stack.element;

        dispatchStackDragEvent(
          "stack-drag-enter",
          dragInfo.current,
          activeStack.current
        );
      }
    },
    [initialOffset, draggedCards]
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
    initialOffset.current = { x: 0, y: 0 };
    didMove.current = false;
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
