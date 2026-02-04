'use client';

import { Tabs } from '@chakra-ui/react';
import { useState } from 'react';

import { ActionType } from '@/client/types/drawer';

import { GoalForm } from './forms/goal-form';
import { NoteForm } from './forms/note-form';
import { RecordForm } from './forms/record-form';

export function CreateActionDrawerContent({ onClose }: { onClose: () => void }) {
  const [createTab, setCreateTab] = useState<ActionType>(ActionType.Record);
  return (
    <Tabs.Root
      value={createTab}
      onValueChange={(e) => {
        const value = e.value;
        if (value === ActionType.Record || value === ActionType.Goal || value === ActionType.Note) {
          setCreateTab(value);
        }
      }}
    >
      <Tabs.List>
        <Tabs.Trigger value={ActionType.Record}>Record</Tabs.Trigger>
        <Tabs.Trigger value={ActionType.Goal}>Goal</Tabs.Trigger>
        <Tabs.Trigger value={ActionType.Note}>Note</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value={ActionType.Record}>
        <RecordForm onSuccess={onClose} onCancel={onClose} />
      </Tabs.Content>
      <Tabs.Content value={ActionType.Goal}>
        <GoalForm onSuccess={onClose} onCancel={onClose} />
      </Tabs.Content>
      <Tabs.Content value={ActionType.Note}>
        <NoteForm onSuccess={onClose} onCancel={onClose} />
      </Tabs.Content>
    </Tabs.Root>
  );
}
