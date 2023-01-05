import { useRecoilValue } from "recoil";

import {
  cardStackState,
  cardIsFaceUpState,
  cardIsTopmostState,
} from "../state/cards";
import { Card } from "../types";
import { getStackType } from "../util";

import { useAutoMove, useDealFromDeck } from "./game";

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
