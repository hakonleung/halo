'use client';

import { Box } from '@chakra-ui/react';
import { TopNavbar } from './top-navbar';
import { ActionButton } from '@/components/shared/action-button';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for authenticated pages, including navbar and action button
 */
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <Box minH="100vh" bg="bg.deep">
      <TopNavbar />
      <Box as="main" p={0}>
        {children}
      </Box>
      <ActionButton />
    </Box>
  );
}

