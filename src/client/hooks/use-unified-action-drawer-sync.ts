'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUrlQuery } from '@/client/hooks/use-url-query';
import { useUnifiedActionDrawerStore } from '@/client/store/unified-action-drawer-store';
import { ActionType } from '@/client/types/drawer';

/**
 * Hook to sync URL query parameters with unified action drawer store
 */
export function useUnifiedActionDrawerSync() {
  const searchParams = useSearchParams();
  const { removeQuery } = useUrlQuery();
  const { setAction, closeDrawer: storeCloseDrawer } = useUnifiedActionDrawerStore();

  useEffect(() => {
    const goalId = searchParams.get('goal');
    const recordId = searchParams.get('record');
    const noteId = searchParams.get('note');
    const definitionId = searchParams.get('definition');
    const action = searchParams.get('action'); // For create mode

    let actionType: ActionType | null = null;
    let actionDataId: string | null = null;

    if (goalId) {
      actionType = ActionType.Goal;
      actionDataId = goalId;
    } else if (recordId) {
      actionType = ActionType.Record;
      actionDataId = recordId;
    } else if (noteId) {
      actionType = ActionType.Note;
      actionDataId = noteId;
    } else if (definitionId) {
      actionType = ActionType.Definition;
      actionDataId = definitionId;
    } else if (action) {
      // Create mode
      if (
        action === ActionType.Record ||
        action === ActionType.Goal ||
        action === ActionType.Note
      ) {
        actionType = action;
        actionDataId = null;
      }
    }

    if (actionType) {
      setAction(actionType, actionDataId);
    } else {
      storeCloseDrawer();
    }
  }, [searchParams, setAction, storeCloseDrawer]);

  const closeDrawer = () => {
    const goalId = searchParams.get('goal');
    const recordId = searchParams.get('record');
    const noteId = searchParams.get('note');
    const definitionId = searchParams.get('definition');
    const action = searchParams.get('action');

    if (goalId) removeQuery('goal');
    if (recordId) removeQuery('record');
    if (noteId) removeQuery('note');
    if (definitionId) removeQuery('definition');
    if (action) removeQuery('action');

    storeCloseDrawer();
  };

  return { closeDrawer };
}
