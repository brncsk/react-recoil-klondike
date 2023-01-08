import { CardDragInfo, StackDragEventType } from "../types";

export class StackDragEvent extends CustomEvent<CardDragInfo> {
  constructor(type: StackDragEventType, detail: CardDragInfo) {
    super(type, { detail });
  }
}

declare global {
  // NOTE: The keys below must match the keys in StackDragEventType
  interface HTMLElementEventMap {
    "stack-drag-enter": StackDragEvent;
    "stack-drag-leave": StackDragEvent;
    "stack-drop": StackDragEvent;
  }
}
