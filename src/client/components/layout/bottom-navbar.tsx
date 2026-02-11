'use client';

import { Box, HStack, Text, Link } from '@chakra-ui/react';
import { LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Bottom navigation bar component (mobile only)
 */
export function BottomNavbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Log', path: '/log', icon: LayoutDashboard },
    { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <Box
      display={{ base: 'block', md: 'none' }}
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      h="64px"
      background="transparent"
      backdropFilter="blur(16px)"
      borderTop="1px solid"
      borderColor="matrix/20"
      zIndex={200}
      pb="env(safe-area-inset-bottom)"
    >
      <HStack h="full" justify="space-around" px={2}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              asChild
              key={item.path}
              _hover={{ textDecoration: 'none' }}
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap={1}
            >
              <NextLink href={item.path}>
                <Icon
                  size={20}
                  color={isActive ? 'brand.matrix' : 'text.mist'}
                  style={{
                    filter: isActive
                      ? `drop-shadow(0 0 4px var(--chakra-colors-brand-matrix))`
                      : 'none',
                  }}
                />
                <Text
                  fontSize="10px"
                  color={isActive ? 'brand.matrix' : 'text.mist'}
                  fontFamily="mono"
                  textTransform="uppercase"
                  letterSpacing="0.5px"
                >
                  {item.label}
                </Text>
              </NextLink>
            </Link>
          );
        })}
      </HStack>
    </Box>
  );
}
