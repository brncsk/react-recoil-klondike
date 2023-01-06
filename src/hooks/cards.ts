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

  return {
    onClick: topmost && stackType === "deck" ? () => dealFromDeck() : undefined,
    onDoubleClick: topmost && faceUp ? () => autoMove(stack) : undefined,
  };
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
