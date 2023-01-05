import { atom, atomFamily } from "recoil";
import { CardDragInfo, Card } from "../types";

/** Returns details about the current drag operation. */
export const dragInfoState = atom<CardDragInfo | null>({
  key: "drag-info",
  default: null,
});

/** Returns whether a card is being dragged. */
export const cardDraggedState = atomFamily<boolean, Card>({
  key: "card-dragged",
  default: false,
});

export const dragInitialOffsetState = atom<{ x: number; y: number }>({
  key: "drag-initial-offset",
  default: { x: 0, y: 0 },
});

export const dragOffsetState = atom<{ x: number; y: number }>({
  key: "drag-offset",
  default: { x: 0, y: 0 },
});
