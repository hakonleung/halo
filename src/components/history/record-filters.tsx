'use client';

import { FilterBar, type FilterConfig } from '@/components/shared/filter-bar';
import type { BehaviorCategory } from '@/types/behavior-client';

export interface RecordFiltersType {
  category?: BehaviorCategory | 'all';
  search?: string;
  startDate?: string;
  endDate?: string;
}

interface RecordFiltersProps {
  filters: RecordFiltersType;
  onFilterChange: (newFilters: Partial<RecordFiltersType>) => void;
}

const categoryOptions = [
  { label: 'All Categories', value: 'all' },
  { label: 'Health', value: 'health' },
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
  { label: 'Habit', value: 'habit' },
  { label: 'Other', value: 'other' },
];

export function RecordFilters({ filters, onFilterChange }: RecordFiltersProps) {
  const filterConfigs: FilterConfig[] = [
    {
      key: 'category',
      type: 'select',
      placeholder: 'Category',
      options: categoryOptions,
      value: filters.category || 'all',
      minW: '100px',
    },
    {
      key: 'search',
      type: 'search',
      placeholder: 'Search...',
      value: filters.search || '',
      maxW: '150px',
    },
    {
      key: 'startDate',
      type: 'datepicker',
      value: filters.startDate || '',
      maxW: '120px',
    },
    {
      key: 'endDate',
      type: 'datepicker',
      value: filters.endDate || '',
      maxW: '120px',
    },
  ];

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'category') {
      if (value === 'all') {
        onFilterChange({ category: undefined });
      } else {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        onFilterChange({ category: value as BehaviorCategory });
      }
    } else {
      onFilterChange({ [key]: value || undefined });
    }
  };

  return <FilterBar filters={filterConfigs} onChange={handleFilterChange} compact />;
}
