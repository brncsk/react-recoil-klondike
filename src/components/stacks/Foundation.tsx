import { canDropOntoFoundation, useStack } from "../../hooks/stacks";

export function Foundation({ n }: { n: number }) {
  return (
    <div
      {...useStack({
        stack: `foundation-${n}`,
        gridColumn: 3 + n,
        canDrop: canDropOntoFoundation,
      })}
    />
  );
}
