import { Card, CardDragInfo, Stack } from "../types";

export let emptyImage = new Image();
emptyImage.src =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export function dispatchStackDragEvent(
  type: "stack-drag-enter" | "stack-drag-leave" | "stack-drop",
  dragInfo: CardDragInfo,
  element: HTMLElement
) {
  const event = new CustomEvent(type, { detail: dragInfo });
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
