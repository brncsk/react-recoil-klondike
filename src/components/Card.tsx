import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE as useRecoilValue } from "recoil";
import clsx from "clsx";

import { Card as CardType, Stack } from "../types";
import { getCardColor, getCardStyles } from "../util";
import { useCardEventProps } from "../hooks";

import {
  cardIsFaceUpState,
  cardPositionState,
  cardStackState,
  cardZIndexState,
} from "../state/cards";
import { cardDraggedState } from "../state/drag-and-drop";

import { CardFace } from "./CardFace";

export interface CardProps {
  card: CardType;
  stack?: Stack;
}

export function Card({ card }: CardProps) {
  const color = getCardColor(card);
  const stack = useRecoilValue(cardStackState(card));
  const faceUp = useRecoilValue(cardIsFaceUpState(card));

  const position = useRecoilValue(cardPositionState(card));
  const zIndex = useRecoilValue(cardZIndexState(card));
  const dragged = useRecoilValue(cardDraggedState(card));

  return (
    <div
      data-card={card}
      data-stack={stack}
      className={clsx("card", color, faceUp ? "face-up" : "face-down", {
        dragged,
      })}
      style={getCardStyles({ position, faceUp, dragged, zIndex })}
      {...useCardEventProps(card)}
      draggable="false"
    >
      <CardFace card={card} />
    </div>
  );
}
