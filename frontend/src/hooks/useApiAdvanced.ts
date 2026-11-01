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

/**
 * @deprecated Use api methods from @/services/api or TanStack query hooks in @/hooks/useApi.
 * All HTTP requests must go through the centralized ApiClient in @/services/api.
 */
async function fetchWithTimeout(
  _url: string,
  _options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  throw new Error("Direct fetch is deprecated. Use @/services/api instead.");
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
  const debounceTimer = useRef<NodeJS.Timeout>();

  const fetchHandler = useCallback(async (customUrl?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const finalUrl = customUrl || url;
      const response = await fetchWithTimeout(finalUrl, {
        timeoutMs: options?.timeoutMs || DEFAULT_TIMEOUT_MS,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
      options?.onSuccess?.(data);
    } catch (error) {
      const message = handleError(error, "Failed to fetch data");
      setState((prev) => ({ ...prev, loading: false, error: message }));
      options?.onError?.(error);
    }
  }, [url, options, handleError]);

  // Debounced fetch
  const debouncedFetch = useCallback(
    (customUrl?: string) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (options?.debounceMs) {
        debounceTimer.current = setTimeout(() => {
          fetchHandler(customUrl);
        }, options.debounceMs);
      } else {
        fetchHandler(customUrl);
      }
    },
    [fetchHandler, options?.debounceMs]
  );

  useEffect(() => {
    if (options?.autoFetch !== false) {
      debouncedFetch();
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [debouncedFetch, options?.autoFetch]);

  return { ...state, fetch: debouncedFetch, refetch: fetchHandler };
}
