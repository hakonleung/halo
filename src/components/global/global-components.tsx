'use client';
import { AnimatedBackground } from '@/components/layout/animated-background';
import { UnifiedActionDrawer } from '@/components/global/action/unified-action-drawer';
import { EditorModal } from '@/components/global/editor/editor-modal';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { system } from '@/styles/theme';
import { useState } from 'react';

/**
 * Global components wrapper that includes all global UI elements
 * - AnimatedBackground: Background animation
 * - UnifiedActionDrawer: Unified drawer for creating and viewing records/goals/notes
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
        <UnifiedActionDrawer />
        <EditorModal />
      </ChakraProvider>
    </QueryClientProvider>
  );
}
