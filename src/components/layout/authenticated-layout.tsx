'use client';

import { Box, Flex } from '@chakra-ui/react';
import { TopNavbar } from './top-navbar';
import { BottomNavbar } from './bottom-navbar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for authenticated pages, including navbar
 * Note: ActionDrawer is now rendered in GlobalComponents
 */
export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <Flex
      flexDir="column"
      alignItems="stretch"
      minH="100vh"
      bg="transparent"
      position="relative"
      zIndex={1}
    >
      <TopNavbar />
      <Box as="main" p={0} pb={{ base: '64px', md: 0 }}>
        {children}
      </Box>
      <BottomNavbar />
    </Flex>
  );
}
