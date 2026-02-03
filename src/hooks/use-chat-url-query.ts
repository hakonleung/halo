import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook for syncing conversation ID with URL query
 */
export function useChatUrlQuery() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const conversationId = searchParams.get('convId') ?? undefined;

  const setConversationId = useCallback(
    (id: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set('convId', id);
      } else {
        params.delete('convId');
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return { conversationId, setConversationId };
}
