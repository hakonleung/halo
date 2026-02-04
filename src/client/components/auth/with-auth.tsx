'use client';

import { Box, Text } from '@chakra-ui/react';

import { AuthForm } from '@/client/components/auth/auth-form';
import { useUser } from '@/client/hooks/use-user';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useUser();

    if (isLoading) {
      return (
        <Box
          minH="100vh"
          bg="transparent"
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          zIndex={1}
        >
          <Text color="text.mist" fontFamily="mono">
            [ LOADING... ]
          </Text>
        </Box>
      );
    }

    if (!isAuthenticated) {
      return <AuthForm />;
    }

    return <Component {...props} />;
  };
}
