'use client';
import { AnimatedBackground } from '@/client/components/layout/animated-background';
import { UnifiedActionDrawer } from '@/client/components/actions';
import { EditorModal } from '@/client/components/editor';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { system } from '@/client/theme';
import { useState } from 'react';

import { ConfirmDialog } from '@/client/components/shared/confirm-dialog';
import { useConfirmDialogStore } from '@/client/store/confirm-dialog-store';

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
        <GlobalConfirmDialog />
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export function GlobalConfirmDialog() {
  const { isOpen, config, closeDialog, setLoading } = useConfirmDialogStore();
  const handleConfirm = async () => {
    if (!config) return;
    try {
      setLoading(true);
      await config.onConfirm();
      closeDialog();
    } catch {
      // Error handling is done by the caller
      setLoading(false);
    }
  };
  if (!config) return null;
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={closeDialog}
      onConfirm={handleConfirm}
      title={config.title}
      message={config.message}
      confirmLabel={config.confirmLabel}
      cancelLabel={config.cancelLabel}
      confirmColorScheme={config.confirmColorScheme}
      isLoading={config.isLoading}
    />
  );
}
