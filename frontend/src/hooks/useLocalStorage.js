import { useState, useEffect } from "react";
import { storage } from "../services/storage.js";

/**
 * useLocalStorage — Custom hook for localStorage state sync
 * Returns [value, setValue] like useState
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
