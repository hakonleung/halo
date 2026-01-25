'use client';

import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useUser } from '@/hooks/use-user';
import { withAuth } from '@/components/auth/with-auth';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';

function DashboardContent() {
  const { user } = useUser();

  return (
    <AuthenticatedLayout>
      <Box p={8}>
        <VStack gap={8} align="stretch" maxW="container.lg" mx="auto">
          <Heading
            as="h1"
            size="2xl"
            color="brand.matrix"
            fontFamily="heading"
            textShadow="0 0 10px currentColor"
          >
            DASHBOARD
          </Heading>
          <Box
            bg="bg.carbon"
            border="1px solid"
            borderColor="brand.matrix"
            borderRadius="4px"
            p={6}
            boxShadow="0 0 15px rgba(0, 255, 65, 0.1)"
          >
            <Text color="text.neon" fontFamily="mono" fontSize="lg" mb={4}>
              Welcome, {user?.email}
            </Text>
            <Text color="text.mist" fontFamily="mono">
              [ SYSTEM ONLINE ]
            </Text>
          </Box>
        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}

export default withAuth(DashboardContent);
