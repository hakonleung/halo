'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  VStack,
  Select,
  createListCollection,
  Input,
  Portal,
} from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { GoalList } from '@/components/goals';
import { useGoals } from '@/hooks/use-goals';
import type { GetGoalsParams } from '@/hooks/use-goals';

const statusOptions = createListCollection({
  items: [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Abandoned', value: 'abandoned' },
  ],
});

const categoryOptions = createListCollection({
  items: [
    { label: 'All Categories', value: 'all' },
    { label: 'Health', value: 'health' },
    { label: 'Finance', value: 'finance' },
    { label: 'Habit', value: 'habit' },
    { label: 'Learning', value: 'learning' },
    { label: 'Other', value: 'other' },
  ],
});

const sortOptions = createListCollection({
  items: [
    { label: 'Created At', value: 'created_at' },
    { label: 'Name', value: 'name' },
  ],
});

export default function GoalsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<GetGoalsParams>({
    sort: 'created_at',
    order: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { goals, isLoading } = useGoals(filters);

  // Filter by search query
  const filteredGoals = searchQuery
    ? goals.filter((goal) => goal.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : goals;

  const handleFilterChange = (key: keyof GetGoalsParams, value: string) => {
    if (value === 'all') {
      setFilters((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  return (
    <AuthenticatedLayout>
      <Container maxW="1400px" py={6}>
        <VStack gap={6} align="stretch">
          {/* Page Header */}
          <HStack justify="space-between" align="center">
            <Heading fontSize="32px" color="text.neon" fontFamily="mono">
              Goal Management
            </Heading>
            <Button colorScheme="green" onClick={() => router.push('/goals/new')}>
              + Create Goal
            </Button>
          </HStack>

          {/* Filters */}
          <Box
            bg="bg.carbon"
            border="1px solid"
            borderColor="rgba(0, 255, 65, 0.3)"
            borderRadius="4px"
            p={4}
          >
            <HStack gap={4} wrap="wrap">
              <Box minW="200px">
                <Select.Root
                  collection={statusOptions}
                  value={[filters.status || 'all']}
                  onValueChange={(e) => {
                    const value = e.value[0];
                    if (typeof value === 'string') {
                      handleFilterChange('status', value);
                    }
                  }}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select Status" />
                  </Select.Trigger>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                        {statusOptions.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>

              <Box minW="200px">
                <Select.Root
                  collection={categoryOptions}
                  value={[filters.category || 'all']}
                  onValueChange={(e) => {
                    const value = e.value[0];
                    if (typeof value === 'string') {
                      handleFilterChange('category', value);
                    }
                  }}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Select Category" />
                  </Select.Trigger>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                        {categoryOptions.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>

              <Box minW="180px">
                <Select.Root
                  collection={sortOptions}
                  value={[filters.sort || 'created_at']}
                  onValueChange={(e) => {
                    const value = e.value[0];
                    if (typeof value === 'string') {
                      handleFilterChange('sort', value);
                    }
                  }}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="Sort By" />
                  </Select.Trigger>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                        {sortOptions.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Box>

              <Input
                placeholder="Search goal name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                maxW="300px"
              />
            </HStack>
          </Box>

          {/* Goal List */}
          <GoalList
            goals={filteredGoals}
            isLoading={isLoading}
            onGoalClick={(goalId) => router.push(`/goals/${goalId}`)}
          />
        </VStack>
      </Container>
    </AuthenticatedLayout>
  );
}
