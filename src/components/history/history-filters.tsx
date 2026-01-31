'use client';

import type { HistoryListRequest } from '@/types/history-client';
import { HistoryItemType } from '@/types/history-server';
import { FilterBar, type FilterConfig } from '@/components/shared/filter-bar';

interface HistoryFiltersProps {
  filters: HistoryListRequest;
  onFilterChange: (newFilters: Partial<HistoryListRequest>) => void;
}

export function HistoryFilters({ filters, onFilterChange }: HistoryFiltersProps) {
  const filterConfigs: FilterConfig[] = [
    {
      key: 'type',
      type: 'select',
      placeholder: 'Type',
      options: [
        { label: 'All Types', value: 'all' },
        { label: 'Behaviors', value: 'behavior' },
        { label: 'Goals', value: 'goal' },
        { label: 'Notes', value: 'note' },
      ],
      value: filters.type === 'all' ? 'all' : filters.type,
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
    if (key === 'type') {
      if (value === 'all') {
        onFilterChange({ type: 'all' });
      } else if (value === 'behavior') {
        onFilterChange({ type: HistoryItemType.Behavior });
      } else if (value === 'goal') {
        onFilterChange({ type: HistoryItemType.Goal });
      } else if (value === 'note') {
        onFilterChange({ type: HistoryItemType.Note });
      }
    } else {
      onFilterChange({ [key]: value || undefined });
    }
  };

  return <FilterBar filters={filterConfigs} onChange={handleFilterChange} compact />;
}
