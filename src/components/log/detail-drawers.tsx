'use client';

import { useDetailDrawer } from './detail-drawer-provider';
import { GoalDetailDrawer } from './goal-detail-drawer';
import { RecordDetailDrawer } from './record-detail-drawer';
import { NoteDetailDrawer } from './note-detail-drawer';

/**
 * Global detail drawers component that automatically shows drawers based on URL query
 */
export function DetailDrawers() {
  const { drawerType, drawerId, closeDrawer } = useDetailDrawer();

  if (!drawerId) return null;

  return (
    <>
      {drawerType === 'goal' && (
        <GoalDetailDrawer goalId={drawerId} isOpen={true} onClose={closeDrawer} />
      )}
      {drawerType === 'record' && (
        <RecordDetailDrawer recordId={drawerId} isOpen={true} onClose={closeDrawer} />
      )}
      {drawerType === 'note' && (
        <NoteDetailDrawer noteId={drawerId} isOpen={true} onClose={closeDrawer} />
      )}
    </>
  );
}
