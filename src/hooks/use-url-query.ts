'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook to manage URL query parameters
 */
export function useUrlQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const getQuery = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams],
  );

  const setQuery = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  const removeQuery = useCallback(
    (key: string) => {
      setQuery(key, null);
    },
    [setQuery],
  );

  const clearAllQueries = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  return {
    getQuery,
    setQuery,
    removeQuery,
    clearAllQueries,
  };
}
