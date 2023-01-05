import clsx from "clsx";
import { NUM_FOUNDATION_STACKS, NUM_TABLEAU_STACKS } from "../const";
import { useBoardDragListeners } from "../hooks/drag-and-drop";
import { generateDeck } from "../util";

import { Card } from "./Card";
import { Stack } from "./Stack";
import { Deck } from "./stacks/Deck";
import { Waste } from "./stacks/Waste";

export function Board() {
  const [{ isDragging }, handlers] = useBoardDragListeners();
  return (
    <div
      className={clsx("board", { dragging: isDragging })}
      style={
        { "--num-tableau-stacks": NUM_TABLEAU_STACKS } as React.CSSProperties
      }
      {...handlers}
    >
      <div className="section foundation">
        <Deck />
        <Waste />

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
