import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE as useRecoilValue } from "recoil";
import clsx from "clsx";

import { useAutoMove } from "../hooks";
import { Card as CardType, CardDragInfo, Stack } from "../types";
import { CardFace } from "./CardFace";

export interface CardProps {
  card: CardType;
  stack?: Stack;
  visible?: boolean;
  faceUp?: boolean;
  topmost?: boolean;
}

export function Card({
  card,
  stack,
  visible = true,
  faceUp = false,
  topmost = false,
}: CardProps) {
  const [, drag, preview] = useDrag(() => {
    const type: CardDragInfo["type"] = topmost ? "single" : "multiple";

    return {
      type,
      item: { type, card, sourceStack: stack } as CardDragInfo,
      canDrag: faceUp,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    };
  }, [card, topmost, faceUp]);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const autoMove = useAutoMove();

  return (
    <div
      // Only set the drag ref if we have a stack (e.g. not in the preview)
      ref={stack ? drag : undefined}
      className={clsx("card")}
      onDoubleClick={
        topmost && visible && faceUp && stack
          ? () => autoMove(stack)
          : undefined
      }
    >
      <CardFace card={card} visible={visible} faceUp={faceUp} />
    </div>
  );
}
