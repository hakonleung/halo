'use client';
import { AnimatedBackground } from '@/components/layout/animated-background';
import { DetailDrawers } from '@/components/global/action/detail-drawers';
import { ActionDrawer } from '@/components/global/action-drawer';
import { EditorModal } from '@/components/global/editor/editor-modal';
import { ChatButton } from './chat/chat-button';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { system } from '@/styles/theme';
import { useState } from 'react';

/**
 * Global components wrapper that includes all global UI elements
 * - AnimatedBackground: Background animation
 * - DetailDrawers: Detail drawers synced with URL query
 * - ActionDrawer: Action drawer for creating records/goals/notes
 * - EditorModal: Global editor modal for rich text and markdown editing
 * - ChatButton: Floating chat button in bottom right corner
 */
export function GlobalComponents({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        {children}
        <AnimatedBackground />
        <DetailDrawers />
        <ActionDrawer />
        <EditorModal />
        <ChatButton />
      </ChakraProvider>
    </QueryClientProvider>
  );
}
