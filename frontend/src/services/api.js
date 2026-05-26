/**
 * api.js — HTTP client wrapper
 * WHAT:  Stateless utility wrapping fetch() with JSON handling, error
 *        normalization, and convenience methods (get/post/put/delete).
 * HOW:   apiCall() merges caller options over DEFAULT_OPTIONS (JSON
 *        Content-Type), calls fetch(), checks response.ok, and parses
 *        JSON. Non-2xx responses throw with status + statusText. Each
 *        api method (get, post, put, delete) calls apiCall with the
 *        appropriate HTTP method, serializing body data for mutations.
 * WHY:   Isolates fetch boilerplate (headers, error parsing, JSON
 *        serialization) from business logic. Callers write
 *        api.get("/users") instead of repeating fetch/try-catch/JSON.parse
 *        in every component.
 */

const DEFAULT_OPTIONS = {
  headers: {
    "Content-Type": "application/json",
  },
};

export async function apiCall(url, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

export const api = {
  get: (url, options) => apiCall(url, { ...options, method: "GET" }),
  post: (url, data, options) =>
    apiCall(url, { ...options, method: "POST", body: JSON.stringify(data) }),
  put: (url, data, options) =>
    apiCall(url, { ...options, method: "PUT", body: JSON.stringify(data) }),
  delete: (url, options) => apiCall(url, { ...options, method: "DELETE" }),
};
