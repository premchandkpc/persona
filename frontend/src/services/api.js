/**
 * API Service — HTTP client wrapper
 * Handles requests, response parsing, error handling
 * Stateless utility for data fetching
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
