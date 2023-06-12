import { AtomEffect } from "recoil";

/**
 * Recoil effect to persist state to local storage.
 * Accepts a key to use for the local storage item.
 *
 * Adapted from https://recoiljs.org/docs/guides/atom-effects/#local-storage-persistence
 *
 * @param key The key to use for the local storage item.
 */
export function localStorageEffect(key: string): AtomEffect<any> {
  return ({ onSet, setSelf }) => {
    const savedValue = localStorage.getItem(key);

    if (savedValue !== null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };
}
