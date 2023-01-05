import { canDropOntoFoundation, useStack } from "../../hooks/stacks";

export function Foundation({ n }: { n: number }) {
  return (
    <div
      {...useStack({
        stack: `foundation-${n}`,
        gridColumn: 1,
        canDrop: canDropOntoFoundation,
      })}
    />
  );
}
