'use client';

import {
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Skeleton,
  Box,
  Badge,
  Tabs,
} from '@chakra-ui/react';
import { ActionType } from '@/types/drawer';
import { RecordForm } from './forms/record-form';
import { DefinitionForm } from './forms/definition-form';
import { DetailSection } from './forms/detail-section';
import { FormButtonGroup } from './forms/form-button-group';
import { useBehaviorRecords, useDeleteBehaviorRecord } from '@/hooks/use-behavior-records';
import { useBehaviorDefinitions } from '@/hooks/use-behavior-definitions';
import { useUnifiedActionDrawerStore } from '@/store/unified-action-drawer-store';
import { useActionGuard } from '@/hooks/use-action-guard';
import { useUnifiedActionDrawerSync } from '@/hooks/use-unified-action-drawer-sync';
import { formatDateTime } from '@/utils/date-format';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-client';

export function RecordActionDrawerContent({
  actionDataId,
  onClose,
}: {
  actionDataId: string;
  onClose: () => void;
}) {
  const { actionType, isEditMode, setEditMode, setAction } = useUnifiedActionDrawerStore();
  const { records, isLoading: isLoadingRecords } = useBehaviorRecords(100, 0);
  const { definitions } = useBehaviorDefinitions();
  const { deleteRecord, isLoading: isDeletingRecord } = useDeleteBehaviorRecord();
  const { closeDrawer } = useUnifiedActionDrawerSync();
  const { guard } = useActionGuard();

  const handleDelete = guard({
    title: 'Delete Record',
    message: 'Are you sure you want to delete this record? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    confirmColorScheme: 'red',
    isLoading: isDeletingRecord,
    onConfirm: async () => {
      await deleteRecord(actionDataId);
      closeDrawer();
    },
  });

  // Find record and definition based on actionType
  let record: BehaviorRecordWithDefinition | undefined;
  let definition: (typeof definitions)[0] | undefined;

  if (actionType === ActionType.Definition && actionDataId) {
    definition = definitions.find((d) => d.id === actionDataId);
    const foundRecord = records.find((r) => r.definitionId === actionDataId);
    if (foundRecord && 'behaviorDefinitions' in foundRecord) {
      record = foundRecord;
    }
  } else if (actionType === ActionType.Record && actionDataId) {
    const foundRecord = records.find((r) => r.id === actionDataId);
    if (foundRecord && 'behaviorDefinitions' in foundRecord) {
      record = foundRecord;
    }
    definition =
      record?.behaviorDefinitions || definitions.find((d) => d.id === record?.definitionId);
  }

  if (isEditMode && actionType === ActionType.Record) {
    if (!record) return null;
    return (
      <RecordForm
        initialData={record}
        onSuccess={() => {
          setEditMode(false);
          onClose();
        }}
        onCancel={() => setEditMode(false)}
      />
    );
  }

  if (isEditMode && actionType === ActionType.Definition) {
    if (!definition) return null;
    return (
      <DefinitionForm
        initialData={definition}
        onSuccess={() => {
          setEditMode(false);
          onClose();
        }}
        onCancel={() => setEditMode(false)}
      />
    );
  }

  const currentTab = actionType === ActionType.Definition ? 'definition' : 'record';

  return (
    <Tabs.Root
      value={currentTab}
      onValueChange={(e) => {
        if (e.value === 'record' && record) {
          setAction(ActionType.Record, record.id);
        } else if (e.value === 'definition' && definition) {
          setAction(ActionType.Definition, definition.id);
        }
      }}
    >
      <Tabs.List>
        {(record || actionType === ActionType.Definition) && (
          <Tabs.Trigger value="record">Record</Tabs.Trigger>
        )}
        {definition && <Tabs.Trigger value="definition">Definition</Tabs.Trigger>}
      </Tabs.List>

      {(record || actionType === ActionType.Definition) && (
        <Tabs.Content value="record">
          {isLoadingRecords ? (
            <VStack gap={4}>
              <Skeleton height="200px" w="full" />
            </VStack>
          ) : !record ? (
            <Box textAlign="center" p={8}>
              <Text color="text.mist" fontFamily="mono">
                Record Not Found
              </Text>
            </Box>
          ) : (
            <VStack gap={6} align="stretch">
              <VStack align="flex-start" gap={2}>
                <HStack justify="space-between" w="full">
                  <HStack gap={2}>
                    {definition?.icon && <Text fontSize="24px">{definition.icon}</Text>}
                    <Heading fontSize="20px" color="text.neon" fontFamily="mono">
                      {definition?.name || 'Record'}
                    </Heading>
                  </HStack>
                </HStack>
                <Text fontSize="sm" color="text.mist" fontFamily="mono">
                  {formatDateTime(record.recordedAt)}
                </Text>
                {record.note && (
                  <Box p={3} bg="bg.dark" borderRadius="4px" w="full">
                    <Text fontSize="sm" color="text.mist">
                      {record.note}
                    </Text>
                  </Box>
                )}
              </VStack>

              {definition && definition.metadataSchema.length > 0 && (
                <DetailSection
                  title="Metadata"
                  items={definition.metadataSchema.map((field) => {
                    const value = record.metadata[field.key];
                    return {
                      key: field.key,
                      label: field.name,
                      value: value !== undefined && value !== null ? String(value) : null,
                    };
                  })}
                  mode="record"
                />
              )}

              <FormButtonGroup
                onCancel={() => {}}
                onSubmit={() => {}}
                showEdit={false}
                onEdit={undefined}
              />
              <HStack gap={2} pt={2}>
                <Button
                  colorScheme="red"
                  onClick={handleDelete}
                  loading={isDeletingRecord}
                  flex={1}
                >
                  Delete
                </Button>
              </HStack>
            </VStack>
          )}
        </Tabs.Content>
      )}

      {definition && (
        <Tabs.Content value="definition">
          {!definition ? (
            <Box textAlign="center" p={8}>
              <Text color="text.mist" fontFamily="mono">
                Definition Not Found
              </Text>
            </Box>
          ) : (
            <VStack gap={6} align="stretch">
              <VStack align="flex-start" gap={2}>
                <HStack justify="space-between" w="full">
                  <HStack gap={2}>
                    {definition.icon && <Text fontSize="24px">{definition.icon}</Text>}
                    <Heading fontSize="20px" color="text.neon" fontFamily="mono">
                      {definition.name}
                    </Heading>
                  </HStack>
                </HStack>
                <Badge colorPalette="green" variant="outline">
                  {definition.category}
                </Badge>
              </VStack>

              {definition.metadataSchema.length > 0 && (
                <DetailSection
                  title="Metadata Schema"
                  items={definition.metadataSchema.map((field) => ({
                    key: field.key,
                    label: field.name,
                    type: field.type,
                    required: field.required,
                  }))}
                  mode="definition"
                />
              )}

              <FormButtonGroup
                onCancel={() => {}}
                onSubmit={() => {}}
                showEdit={!isEditMode}
                onEdit={() => setEditMode(true)}
              />
            </VStack>
          )}
        </Tabs.Content>
      )}
    </Tabs.Root>
  );
}
