import { useCallback, useLayoutEffect } from "react";
import { debounce } from "../util/debounce";

const USE_VIEWPORT_SIZE_DEFAULT_DEBOUNCE_INTERVAL_MS = 500;

export function useViewportSizeObserver(
  callback: () => void,
  debounceInterval = USE_VIEWPORT_SIZE_DEFAULT_DEBOUNCE_INTERVAL_MS
) {
  const handleResize = useCallback(() => {
    debounce(callback, debounceInterval)();
  }, [callback, debounceInterval]);

  useLayoutEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);
}
