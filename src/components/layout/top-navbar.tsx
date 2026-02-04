'use client';

import { Box, HStack, Text, Link, IconButton } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useOpenChat } from '@/hooks/use-open-chat';
import { ChatModal } from '@/components/global/chat/chat-modal';
import { Plus } from 'lucide-react';
import { useUrlQuery } from '@/hooks/use-url-query';

/**
 * Top navigation bar component
 */
export function TopNavbar() {
  const pathname = usePathname();
  const { isOpen, openChat, closeChat } = useOpenChat();
  const { setQuery } = useUrlQuery();

  const navLinks = [
    { label: 'LOG', path: '/log' },
    { label: 'DASHBOARD', path: '/dashboard' },
    { label: 'SETTINGS', path: '/settings' },
  ];

  return (
    <Box
      h="64px"
      background="transparent"
      backdropFilter="blur(16px)"
      borderBottom="1px solid"
      borderColor="rgba(0, 255, 65, 0.2)"
      position="sticky"
      top={0}
      zIndex={200}
      px={{ base: 4, md: 8 }}
    >
      <HStack h="full" justify="space-between">
        <HStack gap={8}>
          <Box
            onClick={openChat}
            cursor="pointer"
            _hover={{ opacity: 0.8 }}
            transition="opacity 0.2s"
          >
            <Text
              fontFamily="heading"
              color="brand.matrix"
              fontSize="xl"
              textShadow="0 0 10px currentColor"
              fontWeight="bold"
            >
              NEO-LOG
            </Text>
          </Box>

          <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
            {navLinks.map((link) => (
              <Link asChild key={link.path} _hover={{ textDecoration: 'none' }}>
                <NextLink href={link.path}>
                  <Text
                    fontFamily="mono"
                    fontSize="sm"
                    color={pathname === link.path ? 'brand.matrix' : 'text.mist'}
                    position="relative"
                    pb="2px"
                    _after={
                      pathname === link.path
                        ? {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '2px',
                            bg: 'brand.matrix',
                            boxShadow: '0 0 5px #00FF41',
                          }
                        : {}
                    }
                    _hover={{ color: 'brand.matrix' }}
                  >
                    {link.label}
                  </Text>
                </NextLink>
              </Link>
            ))}
          </HStack>
        </HStack>

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
          onClick={() => setQuery('action', 'record')}
        >
          <Plus size={32} strokeWidth={3} />
        </IconButton>
      </HStack>
      <ChatModal isOpen={isOpen} onClose={closeChat} />
    </Box>
  );
}
