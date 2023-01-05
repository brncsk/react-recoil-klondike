import { useStack } from "../../hooks/stacks";

export function Waste() {
  return (
    <div
      {...useStack({
        stack: "waste",
        gridColumn: 2,
        canDrop: () => false,
      })}
    />
  );
}
