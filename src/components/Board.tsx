import clsx from "clsx";
import { NUM_FOUNDATION_STACKS, NUM_TABLEAU_STACKS } from "../const";
import { useBoardDragListeners } from "../hooks/drag-and-drop";
import { generateDeck } from "../util";

import { Card } from "./Card";
import { Deck } from "./stacks/Deck";
import { Foundation } from "./stacks/Foundation";
import { Tableau } from "./stacks/Tableau";
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
            <Foundation key={`foundation-${index + 1}`} n={index + 1} />
          ))}
      </div>
      <div className="section tableau">
        {Array(NUM_TABLEAU_STACKS)
          .fill(0)
          .map((_, index) => (
            <Tableau key={`tableau-${index + 1}`} n={index + 1} />
          ))}
      </div>
      {generateDeck().map((card) => (
        <Card key={card} card={card} />
      ))}
    </div>
  );
}
