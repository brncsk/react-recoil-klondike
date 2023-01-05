import { useCallback, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import clsx from "clsx";

import { Stack as StackId } from "../types";
import { debounce, getStackGridColumn, getStackType } from "../util";
import { useStackDropListeners } from "../drag-and-drop";
import { useDealFromDeck } from "../hooks";
import { stackPositionState } from "../state/stacks";

const STACK_REPOSITION_DEBOUNCE_TIMEOUT_MS = 500;

export function Stack({ stack }: { stack: StackId }) {
  const ref = useRef<HTMLDivElement>(null);
  const dealFromDeck = useDealFromDeck();

  const [stackPosition, setStackPosition] = useRecoilState(
    stackPositionState(stack)
  );

  const updatePosition = useCallback(() => {
    // Set the stack position so that we can use it to calculate the
    // position of the cards in the stack.

    if (!ref.current) {
      return;
    }

    const { x, y } = ref.current.getBoundingClientRect();

    if (stackPosition.x === x && stackPosition.y === y) {
      return;
    }

    setStackPosition({ x, y });
  }, [stackPosition, setStackPosition]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });

    resizeObserver.observe(document.body);
    debounce(updatePosition, STACK_REPOSITION_DEBOUNCE_TIMEOUT_MS);

    return () => resizeObserver.disconnect();
  }, [updatePosition]);

  const [{ isDropTarget }, handlers] = useStackDropListeners({ stack });

  return (
    <div
      ref={ref}
      className={clsx("stack", getStackType(stack), stack, {
        "drop-target": isDropTarget,
      })}
      style={{ gridColumn: getStackGridColumn(stack) }}
      {...handlers}
      onClick={getStackType(stack) === "deck" ? dealFromDeck : undefined}
    />
  );
}
