import { startTransition, useCallback, useState } from "react";
import { CallbackInterface, useRecoilCallback } from "recoil";

import { CanDrop, Card, CardDragInfo, Stack } from "../types";
import { generateDeck, emptyImage } from "../util";

import { stackCardsState } from "../state/stacks";
import { cardStackIndexState, topmostCardState } from "../state/cards";
import {
  dragInfoState,
  dragInitialOffsetState,
  dragOffsetState,
  cardDraggedState,
} from "../state/drag-and-drop";

import { useMoveCard } from "./game";

export function useBoardDragListeners() {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useRecoilCallback(
    (iface) => (e: React.MouseEvent<HTMLDivElement>) => {
      // Get the child element that was clicked on.
      const cardElement = e.nativeEvent.composedPath().find((el) => {
        if (!(el instanceof HTMLElement)) {
          return false;
        }

        return (
          el.classList.contains("card") && el.classList.contains("face-up")
        );
      }) as HTMLElement | undefined;

      if (!cardElement) {
        return;
      }

      const card = cardElement.dataset.card as Card;
      const stack = cardElement.dataset.stack as Stack;

      iface.set(dragInfoState, { card, sourceStack: stack });
    }
  );

  const handleDragStart = useRecoilCallback(
    (iface) => (e: React.DragEvent<HTMLDivElement>) => {
      const dragInfo = iface.snapshot.getLoadable(dragInfoState).valueOrThrow();

      if (!dragInfo) {
        e.preventDefault();
        return;
      }

      // This is a hack to prevent the browser from trying to drag the card
      // image. We don't want to do that because we're using CSS transforms
      // to move the card around.
      e.dataTransfer.setDragImage(emptyImage, 0, 0);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.dropEffect = "move";

      handleDragEdge(iface)(dragInfo);
      iface.set(dragInitialOffsetState, { x: e.clientX, y: e.clientY });
      iface.set(dragOffsetState, { x: e.clientX, y: e.clientY });
      setIsDragging(true);
    }
  );

  const handleDrag = useRecoilCallback(
    ({ set }) =>
      (e: React.DragEvent<HTMLDivElement>) => {
        if (e.clientX === 0 && e.clientY === 0) {
          return;
        }

        set(dragOffsetState, { x: e.clientX, y: e.clientY });
      }
  );

  const handleDragEnd = useRecoilCallback((iface) => () => {
    iface.reset(dragInfoState);
    handleDragEdge(iface)(null);
    setIsDragging(false);
  });

  return [
    { isDragging },
    {
      onMouseDown: handleMouseDown,
      onDragStartCapture: handleDragStart,
      onDrag: handleDrag,
      onDragEnd: handleDragEnd,
      draggable: true,

      // This is to immediately end the drag operation when the mouse is
      // released.
      onDragOver: (e) => e.preventDefault(),
    } as React.HTMLAttributes<HTMLDivElement>,
  ] as const;
}

export function useStackDropListeners({
  stack,
  canDrop,
}: {
  stack: Stack;
  canDrop: CanDrop;
}) {
  const [isDropTarget, setIsDropTarget] = useState(false);

  const moveCard = useMoveCard();

  const handleDragEnter = useRecoilCallback(
    ({ snapshot: { getLoadable: get } }) =>
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const dragInfo = get(dragInfoState).valueOrThrow();
        const topmostCardOnTarget = get(topmostCardState(stack)).valueOrThrow();

        if (dragInfo) {
          setIsDropTarget(canDrop(dragInfo, topmostCardOnTarget));
        }
      }
  );

  const handleDragLeave = useCallback(() => {
    setIsDropTarget(false);
  }, []);

  const handleDrop = useRecoilCallback(
    (iface) => () => {
      const dragInfo = iface.snapshot.getLoadable(dragInfoState).valueOrThrow();
      const topmostCardOnTarget = iface.snapshot
        .getLoadable(topmostCardState(stack))
        .valueOrThrow();

      if (dragInfo && canDrop(dragInfo, topmostCardOnTarget)) {
        handleDragEdge(iface)(null);
        moveCard(dragInfo.sourceStack, stack, dragInfo.card);
      }

      setIsDropTarget(false);
    },
    []
  );

  return [
    { isDropTarget },
    {
      onDragEnter: (e) => startTransition(() => handleDragEnter(e)),
      onDragOver: (e) => startTransition(() => handleDragEnter(e)),
      onDragLeave: () => startTransition(() => handleDragLeave()),
      onDrop: handleDrop,
    } as React.HTMLAttributes<HTMLDivElement>,
  ] as const;
}

/**
 * Handles the start and end of a drag operation.
 * @param dragInfo The drag info, or null if the drag operation has ended.
 *
 */
function handleDragEdge({
  set,
  snapshot: { getLoadable: get },
}: CallbackInterface) {
  return function (dragInfo: CardDragInfo | null) {
    if (!dragInfo) {
      generateDeck().forEach((card) => set(cardDraggedState(card), false));
      return;
    }

    const cards = get(stackCardsState(dragInfo.sourceStack)).valueOrThrow();
    const startIndex = get(cardStackIndexState(dragInfo.card)).valueOrThrow();

    cards.slice(startIndex).forEach((card) => {
      set(cardDraggedState(card), true);
    });
  };
}
