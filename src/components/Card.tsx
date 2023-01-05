import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE as useRecoilValue } from "recoil";
import clsx from "clsx";

import { Card as CardType, Stack } from "../types";
import { getCardColor, getCardStyles } from "../util";
import {
  cardDraggedState,
  cardIsFaceUpState,
  cardPositionState,
  cardStackState,
  cardZIndexState,
} from "../state";
import { CardFace } from "./CardFace";

export interface CardProps {
  card: CardType;
  stack?: Stack;
  visible?: boolean;
  faceUp?: boolean;
  topmost?: boolean;
}

export function Card({ card }: CardProps) {
  const color = getCardColor(card);
  const stack = useRecoilValue(cardStackState(card));
  const faceUp = useRecoilValue(cardIsFaceUpState(card));

  const position = useRecoilValue(cardPositionState(card));
  const zIndex = useRecoilValue(cardZIndexState(card));

  return (
    <div
      data-card={card}
      data-stack={stack}
      className={clsx("card", color, faceUp ? "face-up" : "face-down", {
        dragged,
      })}
      style={getCardStyles({ position, faceUp, dragged, zIndex })}
          : undefined
      }
    >
      <CardFace card={card} />
    </div>
  );
}
