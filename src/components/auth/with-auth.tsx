'use client';

import { useUser } from '@/hooks/use-user';
import { AuthForm } from '@/components/auth/auth-form';
import { Box, Text } from '@chakra-ui/react';

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useUser();

    if (isLoading) {
      return (
        <Box minH="100vh" bg="bg.deep" display="flex" alignItems="center" justifyContent="center">
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
