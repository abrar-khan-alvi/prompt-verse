/**
 * React Query configuration and setup
 * Provides caching, background refetching, and optimistic updates
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { CACHE } from '@/lib/constants';

/**
 * Create a new QueryClient with default configuration
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: how long data is considered fresh
        staleTime: CACHE.STALE_TIME_MEDIUM,

        // Cache time: how long inactive data stays in cache
        gcTime: CACHE.STALE_TIME_LONG,

        // Retry failed requests
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Refetch on window focus (disabled by default for blockchain data)
        refetchOnWindowFocus: false,

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Refetch on mount if data is stale
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

/**
 * React Query Provider Component
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  // NFT queries
  nft: {
    all: [CACHE.KEYS.NFT_DETAILS] as const,
    detail: (id: string) => [...queryKeys.nft.all, id] as const,
    byOwner: (address: string) => [...queryKeys.nft.all, 'owner', address] as const,
    byCreator: (address: string) => [...queryKeys.nft.all, 'creator', address] as const,
  },

  // Marketplace queries
  marketplace: {
    all: [CACHE.KEYS.MARKETPLACE_NFTS] as const,
    listed: () => [...queryKeys.marketplace.all, 'listed'] as const,
    filtered: (filters: Record<string, any>) =>
      [...queryKeys.marketplace.all, 'filtered', filters] as const,
  },

  // User queries
  user: {
    all: [CACHE.KEYS.USER_NFTS] as const,
    nfts: (address: string) => [...queryKeys.user.all, address] as const,
    transactions: (address: string) => [CACHE.KEYS.USER_TRANSACTIONS, address] as const,
  },

  // Stats queries
  stats: {
    all: [CACHE.KEYS.HERO_STATS] as const,
    hero: () => [...queryKeys.stats.all, 'hero'] as const,
  },
};

/**
 * Optimistic update helper
 * @param queryClient - Query client instance
 * @param queryKey - Query key to update
 * @param updater - Function to update the data
 */
export async function optimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updater: (old: T | undefined) => T
) {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update
  queryClient.setQueryData<T>(queryKey, updater);

  // Return rollback function
  return () => {
    queryClient.setQueryData(queryKey, previousData);
  };
}

/**
 * Invalidate related queries after mutation
 * @param queryClient - Query client instance
 * @param keys - Array of query keys to invalidate
 */
export async function invalidateQueries(queryClient: QueryClient, keys: readonly unknown[][]) {
  await Promise.all(
    keys.map((key) =>
      queryClient.invalidateQueries({
        queryKey: key,
      })
    )
  );
}

/**
 * Prefetch query data
 * @param queryClient - Query client instance
 * @param queryKey - Query key
 * @param queryFn - Query function
 */
export async function prefetchQuery<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: CACHE.STALE_TIME_MEDIUM,
  });
}
