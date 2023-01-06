const debounceMap = new Map<Function, number>();

export function debounce(fn: () => void, ms: number): () => void {
  return () => {
    if (debounceMap.has(fn)) {
      window.clearTimeout(debounceMap.get(fn));
    }

    debounceMap.set(() => {
      fn();
      debounceMap.delete(fn);
    }, window.setTimeout(fn, ms));
  };
}
