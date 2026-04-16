import { useState, useCallback, useEffect, useRef } from "react";
import { useErrorHandler } from "@/lib/errorHandler";

// Default timeout: 15 seconds
const DEFAULT_TIMEOUT_MS = 15000;

interface UseApiOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  autoFetch?: boolean;
  debounceMs?: number;
  timeoutMs?: number; // Request timeout in milliseconds
}

// Helper function to fetch with timeout
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: unknown | null;
}

export function useApiAdvanced<T = unknown>(
  url: string,
  options?: UseApiOptions
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { handleError } = useErrorHandler();
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async (customUrl?: string) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const finalUrl = customUrl || url;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const token = localStorage.getItem("token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetchWithTimeout(finalUrl, {
        headers,
        signal: abortControllerRef.current.signal,
        timeoutMs: options?.timeoutMs || DEFAULT_TIMEOUT_MS,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      options?.onSuccess?.(data);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        const message = handleError(error, "Failed to fetch data");
        setState((prev) => ({ ...prev, loading: false, error: message }));
        options?.onError?.(error);
      }
    }
  }, [url, options, handleError]);

  const debouncedFetch = useCallback(
    (customUrl?: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        fetch(customUrl);
      }, options?.debounceMs || 0);
    },
    [fetch, options?.debounceMs]
  );

  useEffect(() => {
    if (options?.autoFetch !== false) {
      debouncedFetch();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedFetch, options?.autoFetch]);

  return { ...state, fetch: debouncedFetch, refetch: fetch };
}

// Hook for POST/PUT/DELETE requests
export function useApiMutation<T = unknown>(
  baseUrl: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const { handleError } = useErrorHandler();

  const mutate = useCallback(
    async (
      method: "POST" | "PUT" | "DELETE" | "PATCH",
      body?: unknown,
      url?: string
    ): Promise<T | null> => {
      const finalUrl = url || baseUrl;
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetchWithTimeout(finalUrl, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          timeoutMs,
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        setLoading(false);
        return data;
      } catch (err) {
        const message = handleError(err, `Failed to ${method.toLowerCase()} data`);
        setError(message);
        setLoading(false);
        return null;
      }
    },
    [baseUrl, timeoutMs, handleError]
  );

  const post = useCallback(
    (body?: unknown, url?: string) => mutate("POST", body, url),
    [mutate]
  );

  const put = useCallback(
    (body?: unknown, url?: string) => mutate("PUT", body, url),
    [mutate]
  );

  const patch = useCallback(
    (body?: unknown, url?: string) => mutate("PATCH", body, url),
    [mutate]
  );

  const delete_ = useCallback(
    (url?: string) => mutate("DELETE", undefined, url),
    [mutate]
  );

  return { loading, error, post, put, patch, delete: delete_, mutate };
}
