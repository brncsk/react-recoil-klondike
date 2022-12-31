import { useRecoilValue } from "recoil";
import { Stack as StackId } from "./model";
import { stackCardsState, stackNumFaceUpCardsState } from "./state";
import { getStackGridColumn } from "./util";

import { Card } from "./Card";
import { useAutoMove } from "./hooks";

interface StackProps {
  stack: StackId;
  onClick?: () => void;
}

export function Stack({ stack, onClick }: StackProps) {
  const cards = useRecoilValue(stackCardsState(stack));
  const numFaceUp = useRecoilValue(stackNumFaceUpCardsState(stack));
  const isFannedOut = stack.startsWith("tableau");

  const autoMove = useAutoMove();

  return (
    <div
      className={`stack ${stack} ${isFannedOut ? "fanned-out" : ""}`}
      style={{ gridColumn: getStackGridColumn(stack) }}
      onClick={onClick}
    >
      {cards.map((card, index) => (
        <Card
          key={index}
          card={card}
          faceUp={index >= cards.length - numFaceUp}
          onDoubleClick={() => {
            if (index === cards.length - 1) {
              autoMove(stack);
            }
          }}
        />
      ))}
    </div>
  );
}
