'use client';

import { Box, HStack, Text, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Top navigation bar component
 */
export function TopNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { label: 'DASHBOARD', path: '/dashboard' },
    { label: 'CHAT', path: '/chat' },
    { label: 'HISTORY', path: '/history' },
    { label: 'SETTINGS', path: '/settings' },
  ];

  return (
    <Box 
      h="64px" 
      bg="bg.deep" 
      borderBottom="1px solid" 
      borderColor="rgba(0, 255, 65, 0.2)" 
      position="sticky" 
      top={0} 
      zIndex={200}
      px={8}
    >
      <HStack h="full" justify="space-between">
        <HStack gap={8}>
          <Link asChild _hover={{ textDecoration: 'none' }}>
            <NextLink href="/dashboard">
              <Text 
                fontFamily="heading" 
                color="brand.matrix" 
                fontSize="xl" 
                textShadow="0 0 10px currentColor"
                fontWeight="bold"
              >
                NEO-LOG
              </Text>
            </NextLink>
          </Link>

          <HStack gap={6}>
            {navLinks.map((link) => (
              <Link asChild key={link.path} _hover={{ textDecoration: 'none' }}>
                <NextLink href={link.path}>
                  <Text
                    fontFamily="mono"
                    fontSize="sm"
                    color={pathname === link.path ? 'brand.matrix' : 'text.mist'}
                    position="relative"
                    pb="2px"
                    _after={pathname === link.path ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      bg: 'brand.matrix',
                      boxShadow: '0 0 5px #00FF41'
                    } : {}}
                    _hover={{ color: 'brand.matrix' }}
                  >
                    {link.label}
                  </Text>
                </NextLink>
              </Link>
            ))}
          </HStack>
        </HStack>

        <HStack gap={4}>
           {/* User profile / Logout placeholder */}
        </HStack>
      </HStack>
    </Box>
  );
}

