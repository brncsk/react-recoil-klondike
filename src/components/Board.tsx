import { NUM_FOUNDATION_STACKS, NUM_TABLEAU_STACKS } from "../const";
import { generateDeck } from "../util";

import { Card } from "./Card";
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
        <Stack stack="deck" />
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
      {generateDeck().map((card) => (
        <Card key={card} card={card} />
      ))}
    </div>
  );
}
