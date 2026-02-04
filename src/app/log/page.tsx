'use client';

import { Container } from '@chakra-ui/react';

import { AuthenticatedLayout } from '@/client/components/layout/authenticated-layout';
import { MergeLogTimeline } from '@/client/components/log';

export default function LogPage() {
  return (
    <AuthenticatedLayout>
      <Container
        maxW="1400px"
        py={2}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        h={{
          base: 'calc(100vh - 128px)',
          md: 'calc(100vh - 64px)',
        }}
      >
        <MergeLogTimeline />
      </Container>
    </AuthenticatedLayout>
  );
}
