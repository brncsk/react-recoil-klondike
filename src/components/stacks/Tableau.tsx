import { canDropOntoTableau, useStack } from "../../hooks/stacks";

export function Tableau({ n }: { n: number }) {
  return (
    <div
      {...useStack({
        stack: `tableau-${n}`,
        gridColumn: n,
        canDrop: canDropOntoTableau,
      })}
    />
  );
}
