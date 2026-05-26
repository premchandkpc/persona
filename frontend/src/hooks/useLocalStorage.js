import { useState, useEffect } from "react";
import { storage } from "../services/storage.js";

/**
 * useLocalStorage — React state synced to localStorage
 * WHAT:  Returns [value, setValue] like useState, but persists every
 *        update to localStorage under the given key.
 * HOW:   Initializes state via lazy initializer calling storage.get().
 *        A useEffect writes back to localStorage whenever value or key
 *        changes. Cross-tab / cross-window updates are not synced (use
 *        window.onstorage if needed).
 * WHY:   Lets components persist state across page reloads with zero
 *        boilerplate. The API mirrors useState, so migrating from
 *        in-memory state to persistent state is a single line change.
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    return storage.get(key, defaultValue);
  });

  useEffect(() => {
    storage.set(key, value);
  }, [value, key]);

  return [value, setValue];
}
