import { useRecoilValue_TRANSITION_SUPPORT_UNSTABLE as useRecoilValue } from "recoil";
import clsx from "clsx";

import { Card as CardType, Stack } from "../types";
import {
  getCardColor,
  getCardRank,
  getCardSuit,
  getCardZIndex,
} from "../util/cards";
import { useCardEventProps } from "../hooks/cards";

import {
  cardDragListState,
  cardIsFaceUpState,
  cardIsTopmostState,
  cardPositionState,
  cardStackIndexState,
  cardStackState,
} from "../state/cards";

import { CardFace } from "./CardFace";

export interface CardProps {
  card: CardType;
  stack?: Stack;
}

export function Card({ card }: CardProps) {
  const color = getCardColor(card);
  const stack = useRecoilValue(cardStackState(card));
  const index = useRecoilValue(cardStackIndexState(card));
  const faceUp = useRecoilValue(cardIsFaceUpState(card));
  const position = useRecoilValue(cardPositionState(card));
  const topmost = useRecoilValue(cardIsTopmostState(card));
  const dragList = useRecoilValue(cardDragListState(card));

  const hasUninitializedPosition = position == null;

  return (
    <div
      id={`card-${card}`}
      data-card={card}
      data-stack={stack}
      data-topmost={topmost}
      data-drag-list={dragList}
      className={clsx("card", color, faceUp ? "face-up" : "face-down")}
      style={
        {
          "--left": `${position?.x ?? 0}px`,
          "--top": `${position?.y ?? 0}px`,
          "--z-index": getCardZIndex(stack, index),
          "--rank": `"${getCardRank(card)}"`,
          "--suit": `"${getCardSuit(card)}"`,

          opacity: hasUninitializedPosition ? 0 : 1,
        } as any
      }
      {...useCardEventProps(card)}
    >
      <CardFace card={card} />
    </div>
  );
}
