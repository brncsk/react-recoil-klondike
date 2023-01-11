import { TABLEAU_FANOUT_OFFSET_FACE_UP_RATIO } from "../const";
import { Card, CardDragInfo, Position, Rect, Stack } from "../types";

/** Returns the drag info and the dragged cards from a mouse event. */
export function getDragPropsFromEvent(
  e: React.PointerEvent<HTMLElement>
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

/** Returns the viewport-relative rectangle of the currently dragged card(s). */
export function getDragRect({
  cardSize,
  initialOffset,
  currentOffset,
  cardOffset,
  numCards,
}: {
  cardSize: { width: number; height: number };
  initialOffset: Position;
  currentOffset: Position;
  cardOffset: Position;
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
