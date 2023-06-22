import { useCallback } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { Card } from "../types";
import {
  cardStackState,
  cardIsFaceUpState,
  cardIsTopmostState,
  cardSizeState,
} from "../state/cards";
import { getStackType } from "../util/stacks";

import { useAutoMove, useDealFromDeck } from "./game";
import { useViewportSizeObserver } from "./viewport";

export function useCardEventProps(
  card: Card
): React.HTMLAttributes<HTMLDivElement> {
  const autoMove = useAutoMove();
  const dealFromDeck = useDealFromDeck();

  const stack = useRecoilValue(cardStackState(card));
  const stackType = getStackType(stack);
  const faceUp = useRecoilValue(cardIsFaceUpState(card));
  const topmost = useRecoilValue(cardIsTopmostState(card));

  const eventProps: React.HTMLAttributes<HTMLDivElement> = {
    onClick: topmost && stackType === "deck" ? () => dealFromDeck() : undefined,
    onDoubleClick: faceUp ? () => autoMove(stack, { card }) : undefined,
    onTouchEnd: faceUp ? () => autoMove(stack, { card }) : undefined,
  };

  return eventProps;
}

export function useMeasureCardSize() {
  const setCardSize = useSetRecoilState(cardSizeState);
  return useViewportSizeObserver(
    useCallback(() => {
      const cardElement = document.querySelector(".card");
      if (!cardElement) {
        return;
      }

      const { width, height } = cardElement.getBoundingClientRect();
      setCardSize({ width, height });
    }, [setCardSize])
  );
}
