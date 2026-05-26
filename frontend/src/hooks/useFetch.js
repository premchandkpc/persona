import { useState, useEffect } from "react";
import { api } from "../services/api.js";

/**
 * useFetch — Custom hook for data fetching
 * Returns { data, loading, error }
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
  }, [url, options]);

  return state;
}
