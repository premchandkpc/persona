import { useState, useEffect } from "react";
import { api } from "../services/api.js";

/**
 * useFetch — Custom hook for data fetching with loading/error state
 * WHAT:  Accepts a URL and options, returns { data, loading, error }
 *        like a typical async state machine.
 * HOW:   On mount and when url/options change, calls api.get() inside a
 *        useEffect. Uses an isMounted flag to prevent setState after
 *        unmount (stale-closure guard). options is serialized via
 *        JSON.stringify in the dependency array so new object references
 *        don't trigger infinite re-fetches.
 * WHY:   Encapsulates the loading/error/data pattern so components don't
 *        repeat useState+useEffect boilerplate for every API call. The
 *        isMounted pattern follows React recommendations for async effects.
 */
export function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await api.get(url, options);
        if (isMounted) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({ data: null, loading: false, error });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, JSON.stringify(options)]);

  return state;
}
