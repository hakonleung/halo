'use client';

import { Box, IconButton } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { useActionDrawerStore } from '@/store/action-drawer-store';

/**
 * Global floating add button in bottom right corner
 * Triggers the ActionDrawer for creating new records, goals, or notes
 */
export function GlobalAddButton() {
  const { openDrawer } = useActionDrawerStore();

  return (
    <Box position="fixed" bottom={{ base: 20, md: 6 }} right={{ base: 4, md: 6 }} zIndex={100}>
      <IconButton
        aria-label="Create New"
        variant="ghost"
        size="xl"
        color="brand.matrix"
        _hover={{
          color: 'brand.matrix',
          transform: 'scale(1.2)',
          bg: 'transparent',
        }}
        transition="all 0.2s"
        onClick={() => openDrawer()}
      >
        <Plus size={32} strokeWidth={3} />
      </IconButton>
    </Box>
  );
}
