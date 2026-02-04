'use client';

import { Drawer, Portal, HStack, IconButton } from '@chakra-ui/react';
import { Pencil } from 'lucide-react';
import { useUnifiedActionDrawerStore } from '@/store/unified-action-drawer-store';
import { useUnifiedActionDrawerSync } from '@/hooks/use-unified-action-drawer-sync';
import { ActionType } from '@/types/drawer';
import { CreateActionDrawerContent } from './create-action-drawer-content';
import { RecordActionDrawerContent } from './record-action-drawer-content';
import { GoalActionDrawerContent } from './goal-action-drawer-content';
import { NoteActionDrawerContent } from './note-action-drawer-content';

const editButtonConfig: Record<
  ActionType,
  {
    label: string;
    title: string;
  }
> = {
  [ActionType.Record]: { label: 'Edit record', title: 'RECORD DETAILS' },
  [ActionType.Definition]: { label: 'Edit definition', title: 'DEFINITION DETAILS' },
  [ActionType.Goal]: { label: 'Edit goal', title: 'GOAL DETAILS' },
  [ActionType.Note]: { label: 'Edit note', title: 'NOTE DETAILS' },
};

export function UnifiedActionDrawer() {
  // Sync URL with store
  const { closeDrawer } = useUnifiedActionDrawerSync();
  const { actionType, actionDataId, isEditMode, setEditMode } = useUnifiedActionDrawerStore();
  const isOpen = actionType !== null;
  const isCreateMode = !actionDataId;
  if (!isOpen) return null;
  return (
    <>
      <Drawer.Root
        open={isOpen}
        onOpenChange={(e) => (e.open ? undefined : closeDrawer())}
        placement="end"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content width={{ base: 'full', md: '600px' }}>
              <Drawer.Header>
                <HStack justify="space-between" w="full">
                  <Drawer.Title>
                    {isCreateMode ? 'NEW' : editButtonConfig[actionType].title}
                  </Drawer.Title>
                  {!isCreateMode && !isEditMode && actionType && actionDataId && (
                    <IconButton
                      aria-label={editButtonConfig[actionType].label}
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditMode(true)}
                      color="text.mist"
                      _hover={{ color: 'brand.cyber' }}
                    >
                      <Pencil size={16} />
                    </IconButton>
                  )}
                </HStack>
              </Drawer.Header>
              <Drawer.Body>
                {isCreateMode && <CreateActionDrawerContent onClose={closeDrawer} />}
                {!isCreateMode && !!actionDataId && (
                  <>
                    {(actionType === ActionType.Record || actionType === ActionType.Definition) && (
                      <RecordActionDrawerContent
                        actionDataId={actionDataId}
                        onClose={closeDrawer}
                      />
                    )}
                    {actionType === ActionType.Goal && (
                      <GoalActionDrawerContent actionDataId={actionDataId} onClose={closeDrawer} />
                    )}
                    {actionType === ActionType.Note && (
                      <NoteActionDrawerContent actionDataId={actionDataId} onClose={closeDrawer} />
                    )}
                  </>
                )}
              </Drawer.Body>
              <Drawer.CloseTrigger />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
}
