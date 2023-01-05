import { useDealFromDeck } from "../../hooks/game";
import { useStack } from "../../hooks/stacks";

export function Deck() {
  const dealFromDeck = useDealFromDeck();

  return (
    <div
      {...useStack({
        stack: "deck",
        gridColumn: 1,
        canDrop: () => false,
        onClick: dealFromDeck,
      })}
    />
  );
}
