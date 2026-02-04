'use client';

import { useState } from 'react';
import { Drawer, Portal, HStack, IconButton } from '@chakra-ui/react';
import { Pencil } from 'lucide-react';
import { useUnifiedActionDrawerStore } from '@/store/unified-action-drawer-store';
import { useUnifiedActionDrawerSync } from '@/hooks/use-unified-action-drawer-sync';
import { ActionType } from '@/types/drawer';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { CreateActionDrawerContent } from './create-action-drawer-content';
import { RecordActionDrawerContent } from './record-action-drawer-content';
import { GoalActionDrawerContent } from './goal-action-drawer-content';
import { NoteActionDrawerContent } from './note-action-drawer-content';
import { useDeleteBehaviorRecord } from '@/hooks/use-behavior-records';
import { useUpdateGoal, useDeleteGoal } from '@/hooks/use-goals';
import { useDeleteNote } from '@/hooks/use-notes';

export function UnifiedActionDrawer() {
  // Sync URL with store
  const { closeDrawer } = useUnifiedActionDrawerSync();

  const { actionType, actionDataId, isEditMode, setEditMode } = useUnifiedActionDrawerStore();

  const isOpen = actionType !== null;
  const isCreateMode = !actionDataId;

  // Data hooks for delete handlers
  const { deleteRecord, isLoading: isDeletingRecord } = useDeleteBehaviorRecord();
  const { updateGoal, isLoading: isUpdatingGoal } = useUpdateGoal();
  const { deleteGoal, isLoading: isDeletingGoal } = useDeleteGoal();
  const { mutateAsync: deleteNote, isPending: isDeletingNote } = useDeleteNote();

  // Local state for dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);

  const handleDelete = async () => {
    if (!actionDataId) return;
    if (actionType === ActionType.Record) {
      await deleteRecord(actionDataId);
      closeDrawer();
    } else if (actionType === ActionType.Goal) {
      await deleteGoal(actionDataId);
      closeDrawer();
    } else if (actionType === ActionType.Note) {
      await deleteNote(actionDataId);
      closeDrawer();
    }
  };

  const handleMarkComplete = async () => {
    if (!actionDataId) return;
    await updateGoal({ id: actionDataId, updates: { status: 'completed' } });
  };

  const handleAbandon = async () => {
    if (!actionDataId) return;
    await updateGoal({ id: actionDataId, updates: { status: 'abandoned' } });
  };

  const getTitle = () => {
    if (isCreateMode) {
      return 'NEW';
    }
    switch (actionType) {
      case ActionType.Record:
        return 'RECORD DETAILS';
      case ActionType.Goal:
        return 'GOAL DETAILS';
      case ActionType.Note:
        return 'NOTE DETAILS';
      case ActionType.Definition:
        return 'DEFINITION DETAILS';
      default:
        return 'DETAILS';
    }
  };

  const renderContent = () => {
    if (isCreateMode) {
      return <CreateActionDrawerContent onClose={closeDrawer} />;
    }

    if (!actionDataId) return null;

    switch (actionType) {
      case ActionType.Record:
      case ActionType.Definition:
        return (
          <RecordActionDrawerContent
            actionDataId={actionDataId}
            onClose={closeDrawer}
            onDelete={() => setShowDeleteDialog(true)}
            isDeleting={isDeletingRecord}
          />
        );
      case ActionType.Goal:
        return (
          <GoalActionDrawerContent
            actionDataId={actionDataId}
            onClose={closeDrawer}
            onDelete={() => setShowDeleteDialog(true)}
            onAbandon={() => setShowAbandonDialog(true)}
            onMarkComplete={handleMarkComplete}
            isUpdating={isUpdatingGoal}
            isDeleting={isDeletingGoal}
          />
        );
      case ActionType.Note:
        return (
          <NoteActionDrawerContent
            actionDataId={actionDataId}
            onClose={closeDrawer}
            onDelete={() => setShowDeleteDialog(true)}
            isDeleting={isDeletingNote}
          />
        );
      default:
        return null;
    }
  };

  const editButtonConfig: Record<ActionType, string> = {
    [ActionType.Record]: 'Edit record',
    [ActionType.Definition]: 'Edit definition',
    [ActionType.Goal]: 'Edit goal',
    [ActionType.Note]: 'Edit note',
  };

  const renderEditButton = () => {
    if (isCreateMode || isEditMode || !actionType || !actionDataId) return null;

    const ariaLabel = editButtonConfig[actionType];
    if (!ariaLabel) return null;

    return (
      <IconButton
        aria-label={ariaLabel}
        size="sm"
        variant="ghost"
        onClick={() => setEditMode(true)}
        color="text.mist"
        _hover={{ color: 'brand.cyber' }}
      >
        <Pencil size={16} />
      </IconButton>
    );
  };

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
                  <Drawer.Title>{getTitle()}</Drawer.Title>
                  {renderEditButton()}
                </HStack>
              </Drawer.Header>

              <Drawer.Body>{renderContent()}</Drawer.Body>

              <Drawer.CloseTrigger />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title={`Delete ${actionType === ActionType.Goal ? 'Goal' : actionType === ActionType.Record ? 'Record' : 'Note'}`}
        message={`Are you sure you want to delete this ${actionType}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColorScheme="red"
        isLoading={isDeletingRecord || isDeletingGoal || isDeletingNote}
      />

      <ConfirmDialog
        isOpen={showAbandonDialog}
        onClose={() => setShowAbandonDialog(false)}
        onConfirm={handleAbandon}
        title="Abandon Goal"
        message="Are you sure you want to abandon this goal? This action cannot be undone."
        confirmLabel="Abandon"
        cancelLabel="Cancel"
        confirmColorScheme="green"
        isLoading={isUpdatingGoal}
      />
    </>
  );
}
