'use client';

import { useDetailDrawerStore } from '@/store/detail-drawer-store';
import { useDetailDrawerSync } from '@/hooks/use-detail-drawer-sync';
import { GoalDetailDrawer } from './goal-detail-drawer';
import { RecordDetailDrawer } from './record-detail-drawer';
import { NoteDetailDrawer } from './note-detail-drawer';
import { DetailDrawerType } from '@/types/drawer';

/**
 * Global detail drawers component that automatically shows drawers based on URL query
 */
export function DetailDrawers() {
  const { drawerType, drawerId } = useDetailDrawerStore();
  const { closeDrawer } = useDetailDrawerSync();

  if (!drawerId) return null;

  return (
    <>
      {drawerType === DetailDrawerType.Goal && (
        <GoalDetailDrawer goalId={drawerId} isOpen={true} onClose={closeDrawer} />
      )}
      {drawerType === DetailDrawerType.Record && (
        <RecordDetailDrawer recordId={drawerId} isOpen={true} onClose={closeDrawer} />
      )}
      {drawerType === DetailDrawerType.Note && (
        <NoteDetailDrawer noteId={drawerId} isOpen={true} onClose={closeDrawer} />
      )}
    </>
  );
}
