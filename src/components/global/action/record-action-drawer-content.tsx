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
import { useBehaviorRecords } from '@/hooks/use-behavior-records';
import { useBehaviorDefinitions } from '@/hooks/use-behavior-definitions';
import { useUnifiedActionDrawerStore } from '@/store/unified-action-drawer-store';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-client';

interface RecordActionDrawerContentProps {
  actionDataId: string;
  onClose: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function RecordActionDrawerContent({
  actionDataId,
  onClose,
  onDelete,
  isDeleting = false,
}: RecordActionDrawerContentProps) {
  const { actionType, isEditMode, setEditMode, setAction } = useUnifiedActionDrawerStore();
  const { records, isLoading: isLoadingRecords } = useBehaviorRecords(100, 0);
  const { definitions } = useBehaviorDefinitions();

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

  const renderRecordView = () => {
    if (isLoadingRecords) {
      return (
        <VStack gap={4}>
          <Skeleton height="200px" w="full" />
        </VStack>
      );
    }

    if (!record) {
      return (
        <Box textAlign="center" p={8}>
          <Text color="text.mist" fontFamily="mono">
            Record Not Found
          </Text>
        </Box>
      );
    }

    return (
      <VStack gap={6} align="stretch">
        <VStack align="flex-start" gap={2}>
          <HStack justify="space-between" w="full">
            <Heading fontSize="20px" color="text.neon" fontFamily="mono">
              {definition?.name || 'Record'}
            </Heading>
            {definition?.icon && <Text fontSize="24px">{definition.icon}</Text>}
          </HStack>
          <Text fontSize="sm" color="text.mist" fontFamily="mono">
            Recorded: {new Date(record.recordedAt).toLocaleString('en-US')}
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

        <HStack gap={2} pt={4}>
          <Button size="sm" colorScheme="red" onClick={onDelete} loading={isDeleting} flex={1}>
            Delete
          </Button>
        </HStack>
      </VStack>
    );
  };

  const renderDefinitionView = () => {
    if (!definition) {
      return (
        <Box textAlign="center" p={8}>
          <Text color="text.mist" fontFamily="mono">
            Definition Not Found
          </Text>
        </Box>
      );
    }

    return (
      <VStack gap={6} align="stretch">
        <VStack align="flex-start" gap={2}>
          <HStack justify="space-between" w="full">
            <Heading fontSize="20px" color="text.neon" fontFamily="mono">
              {definition.name}
            </Heading>
            {definition.icon && <Text fontSize="24px">{definition.icon}</Text>}
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
      </VStack>
    );
  };

  const renderRecordEditMode = () => {
    if (!record) return null;
    return (
      <RecordForm
        initialData={{
          id: record.id,
          definitionId: record.definitionId,
          metadata: record.metadata,
          note: record.note,
          recordedAt: record.recordedAt,
        }}
        onSuccess={() => {
          setEditMode(false);
          onClose();
        }}
        onCancel={() => setEditMode(false)}
      />
    );
  };

  const renderDefinitionEditMode = () => {
    if (!definition) return null;
    return (
      <DefinitionForm
        initialData={{
          id: definition.id,
          name: definition.name,
          category: definition.category,
          icon: definition.icon,
          metadataSchema: definition.metadataSchema,
        }}
        onSuccess={() => {
          setEditMode(false);
          onClose();
        }}
        onCancel={() => setEditMode(false)}
      />
    );
  };

  if (isEditMode && actionType === ActionType.Record) {
    return renderRecordEditMode();
  }
  if (isEditMode && actionType === ActionType.Definition) {
    return renderDefinitionEditMode();
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
        <Tabs.Content value="record">{renderRecordView()}</Tabs.Content>
      )}
      {definition && <Tabs.Content value="definition">{renderDefinitionView()}</Tabs.Content>}
    </Tabs.Root>
  );
}
