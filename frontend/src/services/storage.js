/**
 * storage.js — localStorage wrapper
 * WHAT:  Stateless utility wrapping localStorage with JSON serialization,
 *        error handling, and fallback defaults.
 * HOW:   All operations are wrapped in try-catch (localStorage can throw
 *        in private browsing or when quota is exceeded). `set` serializes
 *        via JSON.stringify, `get` parses via JSON.parse with a fallback
 *        defaultValue when the key is absent or parsing fails.
 * WHY:   Abstracts JSON serialization and error recovery so callers write
 *        storage.set("key", value) instead of try-catching localStorage
 *        calls everywhere. The defaultValue parameter eliminates null-check
 *        boilerplate at call sites.
 */

export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Storage set failed:", error);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Storage get failed:", error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Storage remove failed:", error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Storage clear failed:", error);
    }
  },
};
