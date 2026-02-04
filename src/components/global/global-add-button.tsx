'use client';

import { Box, IconButton, Text } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { useActionDrawerStore } from '@/store/action-drawer-store';

interface GlobalAddButtonProps {
  variant?: 'nav' | 'mobile-nav';
}

/**
 * Global add button for the navigation bars
 * Triggers the ActionDrawer for creating new records, goals, or notes
 */
export function GlobalAddButton({ variant = 'nav' }: GlobalAddButtonProps) {
  const { openDrawer } = useActionDrawerStore();

  if (variant === 'mobile-nav') {
    return (
      <Box
        as="button"
        onClick={() => openDrawer()}
        flex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1}
        bg="transparent"
        border="none"
        outline="none"
        cursor="pointer"
      >
        <Plus size={20} color="#888888" strokeWidth={2.5} />
        <Text
          fontSize="10px"
          color="text.mist"
          fontFamily="mono"
          textTransform="uppercase"
          letterSpacing="0.5px"
        >
          Add
        </Text>
      </Box>
    );
  }

  return (
    <IconButton
      aria-label="Create New"
      variant="ghost"
      color="text.mist"
      _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.1)' }}
      onClick={() => openDrawer()}
    >
      <Plus size={20} strokeWidth={2.5} />
    </IconButton>
  );
}
