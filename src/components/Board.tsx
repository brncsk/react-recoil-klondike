import { NUM_FOUNDATION_STACKS, NUM_TABLEAU_STACKS } from "../model";
import { useDealFromDeck } from "../hooks";

import { Stack } from "./Stack";

export function Board() {
  const dealFromDeck = useDealFromDeck();

  return (
    <div
      className="board"
      style={
        { "--num-tableau-stacks": NUM_TABLEAU_STACKS } as React.CSSProperties
      }
    >
      <div className="section foundation">
        <Stack stack="deck" onClick={() => dealFromDeck()} />
        <Stack stack="waste" />

        {Array(NUM_FOUNDATION_STACKS)
          .fill(0)
          .map((_, index) => (
            <Stack
              key={`foundation-${index + 1}`}
              stack={`foundation-${index + 1}`}
            />
          ))}
      </div>
      <div className="section tableau">
        {Array(NUM_TABLEAU_STACKS)
          .fill(0)
          .map((_, index) => (
            <Stack
              key={`tableau-${index + 1}`}
              stack={`tableau-${index + 1}`}
            />
          ))}
      </div>
    </div>
  );
}