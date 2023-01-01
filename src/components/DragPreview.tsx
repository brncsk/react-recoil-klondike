import { useRecoilValue } from "recoil";
import { useDragLayer, XYCoord } from "react-dnd";

import { CardDragInfo } from "../model";
import { stackCardsState } from "../state";

import { Card } from "./Card";

function getPreviewStyle(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
): React.CSSProperties {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x}px, ${y}px)`;

  return {
    position: "absolute",
    pointerEvents: "none",
    left: 0,
    top: 0,
    zIndex: 100,
    transform,
    WebkitTransform: transform,
  };
}

export function DragPreview() {
  const { sourceStack, card, initialOffset, currentOffset, isDragging } =
    useDragLayer((monitor) => ({
      ...(monitor.getItem() as CardDragInfo),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

  const cards = useRecoilValue(stackCardsState(sourceStack));

  if (!isDragging) {
    return null;
  }

  return (
    <div
      className="stack drag-preview tableau"
      style={getPreviewStyle(initialOffset, currentOffset)}
    >
      {cards.slice(cards.indexOf(card)).map((card) => (
        <Card key={card} card={card} faceUp />
      ))}
    </div>
  );
}
