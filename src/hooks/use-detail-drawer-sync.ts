'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUrlQuery } from '@/hooks/use-url-query';
import { useDetailDrawerStore } from '@/store/detail-drawer-store';
import { DetailDrawerType } from '@/types/drawer';

/**
 * Hook to sync URL query parameters with detail drawer store
 */
export function useDetailDrawerSync() {
  const searchParams = useSearchParams();
  const { removeQuery } = useUrlQuery();
  const { setDrawer, closeDrawer: storeCloseDrawer } = useDetailDrawerStore();

  useEffect(() => {
    const goalId = searchParams.get('goal');
    const recordId = searchParams.get('record');
    const definitionId = searchParams.get('definition');
    const noteId = searchParams.get('note');

    const drawerType: DetailDrawerType | null = goalId
      ? DetailDrawerType.Goal
      : recordId
        ? DetailDrawerType.Record
        : definitionId
          ? DetailDrawerType.Definition
          : noteId
            ? DetailDrawerType.Note
            : null;

    const drawerId = goalId || recordId || definitionId || noteId || null;

    if (drawerType && drawerId) {
      setDrawer(drawerType, drawerId);
    } else {
      setDrawer(null, null);
    }
  }, [searchParams, setDrawer]);

  const closeDrawer = () => {
    const goalId = searchParams.get('goal');
    const recordId = searchParams.get('record');
    const definitionId = searchParams.get('definition');
    const noteId = searchParams.get('note');

    if (goalId) removeQuery('goal');
    if (recordId) removeQuery('record');
    if (definitionId) removeQuery('definition');
    if (noteId) removeQuery('note');

    storeCloseDrawer();
  };

  return { closeDrawer };
}
