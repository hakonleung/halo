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
} from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { GoalList } from '@/components/goals';
import { useGoals } from '@/hooks/use-goals';
import type { GetGoalsParams } from '@/hooks/use-goals';

const statusOptions = createListCollection({
  items: [
    { label: '全部状态', value: 'all' },
    { label: '进行中', value: 'active' },
    { label: '已完成', value: 'completed' },
    { label: '已放弃', value: 'abandoned' },
  ],
});

const categoryOptions = createListCollection({
  items: [
    { label: '全部分类', value: 'all' },
    { label: '健康', value: 'health' },
    { label: '财务', value: 'finance' },
    { label: '习惯', value: 'habit' },
    { label: '学习', value: 'learning' },
    { label: '其他', value: 'other' },
  ],
});

const sortOptions = createListCollection({
  items: [
    { label: '创建时间', value: 'created_at' },
    { label: '名称', value: 'name' },
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
              目标管理
            </Heading>
            <Button
              colorScheme="green"
              onClick={() => router.push('/goals/new')}
            >
              + 创建目标
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
                  onValueChange={(e) => handleFilterChange('status', e.value[0] as string)}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="选择状态" />
                  </Select.Trigger>
                  <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                    {statusOptions.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box minW="200px">
                <Select.Root
                  collection={categoryOptions}
                  value={[filters.category || 'all']}
                  onValueChange={(e) => handleFilterChange('category', e.value[0] as string)}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="选择分类" />
                  </Select.Trigger>
                  <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                    {categoryOptions.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Box minW="180px">
                <Select.Root
                  collection={sortOptions}
                  value={[filters.sort || 'created_at']}
                  onValueChange={(e) => handleFilterChange('sort', e.value[0] as string)}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder="排序方式" />
                  </Select.Trigger>
                  <Select.Content bg="bg.carbon" borderColor="brand.matrix">
                    {sortOptions.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>

              <Input
                placeholder="搜索目标名称..."
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

