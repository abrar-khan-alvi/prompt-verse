/**
 * Custom hooks for progressive enhancement
 * Provides retry logic, optimistic updates, and better loading states
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { API } from '@/lib/constants';
import { trackError } from '@/utils/analytics';

/**
 * Hook for retry logic with exponential backoff
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    onError?: (error: Error) => void;
  } = {}
) {
  const { maxRetries = API.MAX_RETRIES, initialDelay = API.RETRY_DELAY_MS, onError } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = useCallback(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        setIsRetrying(attempt > 0);

        const result = await fn();

        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(API.RETRY_BACKOFF_MULTIPLIER, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    setIsRetrying(false);
    if (lastError) {
      onError?.(lastError);
      trackError(lastError, { context: 'retry_failed', retryCount });
      throw lastError;
    }
  }, [fn, maxRetries, initialDelay, onError, retryCount]);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
  };
}

/**
 * Hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for optimistic mutation
 */
export function useOptimisticMutation<TData, TVariables, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    queryKey: readonly unknown[];
    updater: (old: TData | undefined, variables: TVariables) => TData;
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
    onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: options.queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(options.queryKey);

      // Optimistically update
      queryClient.setQueryData<TData>(options.queryKey, (old) => options.updater(old, variables));

      // Return context with snapshot
      return { previousData } as TContext;
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context && 'previousData' in context) {
        queryClient.setQueryData(options.queryKey, (context as any).previousData);
      }
      options.onError?.(error as Error, variables, context);
      trackError(error as Error, { context: 'optimistic_mutation_failed' });
    },
    onSuccess: options.onSuccess,
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });
}

/**
 * Hook for polling data
 */
export function usePolling<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options: {
    interval?: number;
    enabled?: boolean;
  } = {}
) {
  const { interval = 5000, enabled = true } = options;

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    refetchInterval: enabled ? interval : false,
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook for local storage with sync
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * Hook for async state management
 */
export function useAsync<T>(asyncFunction: () => Promise<T>, immediate: boolean = true) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as Error);
      setStatus('error');
      trackError(error as Error, { context: 'async_hook' });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}

/**
 * Hook for copy to clipboard
 */
export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return { copiedText, copy };
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
}
