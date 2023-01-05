import { canDropOntoTableau, useStack } from "../../hooks/stacks";
import { tableauStack } from "../../util/stacks";

export function Tableau({ n }: { n: number }) {
  return (
    <div
      {...useStack({
        stack: tableauStack(n),
        gridColumn: n,
        canDrop: canDropOntoTableau,
      })}
    />
  );
}
