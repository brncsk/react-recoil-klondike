export function debounce(fn: () => void, ms: number): () => void {
  let timeoutId: number;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      fn();
    }, ms);
  };
}
