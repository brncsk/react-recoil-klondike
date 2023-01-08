import { TABLEAU_FANOUT_OFFSET_FACE_UP_RATIO } from "../const";
import { Card, CardDragInfo, Rect, Stack, StackDragEventType } from "../types";
import { StackDragEvent } from "./stack-drag-event";

export let emptyImage = new Image();
emptyImage.src =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export function dispatchStackDragEvent(
  type: StackDragEventType,
  dragInfo: CardDragInfo,
  element: HTMLElement
) {
  const event = new StackDragEvent(type, dragInfo);
  element.dispatchEvent(event);
}

export function getDragPropsFromEvent(
  e: React.MouseEvent<HTMLElement>
): { dragInfo: CardDragInfo; draggedCards: HTMLDivElement[] } | null {
  const card = document
    .elementFromPoint(e.clientX, e.clientY)!
    .closest(".card") as HTMLElement;

  if (!card) {
    return null;
  }

  const draggedCards = (card.dataset.dragList?.split(",") as Card[])
    .map(
      (cardId) => document.getElementById(`card-${cardId}`)! as HTMLDivElement
    )
    .filter(Boolean);

  return {
    draggedCards,
    dragInfo: {
      type: card.dataset.topmost === "true" ? "single" : "multiple",
      card: card.dataset.card as Card,
      sourceStack: card.dataset.stack as Stack,
    },
  };
}

export function getStackFromEvent(e: MouseEvent): {
  element: HTMLDivElement;
  stack: Stack;
  topmostCard: Card | null;
} | null {
  const element = document
    .elementsFromPoint(e.clientX, e.clientY)
    .find((element) => element.classList.contains("stack")) as HTMLDivElement;

  if (!element) {
    return null;
  }

  return {
    element,
    stack: element.dataset.stack as Stack,
    topmostCard: element.dataset.topmostCard as Card | null,
  };
}

/** Returns the viewport-relative rectangle of the currently dragged card(s). */
export function getDragRect({
  cardSize,
  initialOffset,
  currentOffset,
  cardOffset,
  numCards,
}: {
  cardSize: { width: number; height: number };
  initialOffset: { x: number; y: number };
  currentOffset: { x: number; y: number };
  cardOffset: { x: number; y: number };
  numCards: number;
}): Rect {
  return {
    x: initialOffset.x + currentOffset.x - cardOffset.x,
    y: initialOffset.y + currentOffset.y - cardOffset.y,
    width: cardSize.width,
    height:
      cardSize.height +
      (numCards - 1) * (cardSize.height / TABLEAU_FANOUT_OFFSET_FACE_UP_RATIO),
  };
}
