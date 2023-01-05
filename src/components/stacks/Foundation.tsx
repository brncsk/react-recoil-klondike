import { canDropOntoFoundation, useStack } from "../../hooks/stacks";
import { foundationStack } from "../../util/stacks";

export function Foundation({ n }: { n: number }) {
  return (
    <div
      {...useStack({
        stack: foundationStack(n),
        gridColumn: 3 + n,
        canDrop: canDropOntoFoundation,
      })}
    />
  );
}
