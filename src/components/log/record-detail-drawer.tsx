'use client';

import { useState } from 'react';
import {
  Drawer,
  Portal,
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
import { useBehaviorRecords } from '@/hooks/use-behavior-records';
import { useBehaviorDefinitions } from '@/hooks/use-behavior-definitions';
import { useDeleteBehaviorRecord } from '@/hooks/use-behavior-records';
import { RecordForm } from '@/components/behaviors/record-form';
import { DefinitionForm } from '@/components/forms';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type { BehaviorRecordWithDefinition } from '@/types/behavior-client';

interface RecordDetailDrawerProps {
  recordId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RecordDetailDrawer({ recordId, isOpen, onClose }: RecordDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'record' | 'definition'>('record');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditDefinition, setIsEditDefinition] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { records, isLoading } = useBehaviorRecords(100, 0); // Get more records to find the one we need
  const { definitions } = useBehaviorDefinitions();
  const { deleteRecord, isLoading: isDeleting } = useDeleteBehaviorRecord();

  const foundRecord = records.find((r) => r.id === recordId);
  let record: BehaviorRecordWithDefinition | undefined;
  if (foundRecord && 'behaviorDefinitions' in foundRecord) {
    record = foundRecord;
  }
  const definition =
    record?.behaviorDefinitions || definitions.find((d) => d.id === record?.definitionId);

  const handleDelete = async () => {
    if (!record) return;
    await deleteRecord(record.id);
    onClose();
  };

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(e) => (e.open ? undefined : onClose())}
      placement="end"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content width={{ base: 'full', md: '600px' }}>
            <Drawer.Header>
              <Drawer.Title>RECORD DETAILS</Drawer.Title>
            </Drawer.Header>

            <Drawer.Body>
              {isEditMode && record && activeTab === 'record' ? (
                <RecordForm
                  initialData={{
                    id: record.id,
                    definitionId: record.definitionId,
                    metadata: record.metadata,
                    note: record.note,
                    recordedAt: record.recordedAt,
                  }}
                  onSuccess={() => {
                    setIsEditMode(false);
                    onClose();
                  }}
                  onCancel={() => setIsEditMode(false)}
                />
              ) : isEditDefinition && definition && activeTab === 'definition' ? (
                <DefinitionForm
                  initialData={{
                    id: definition.id,
                    name: definition.name,
                    category: definition.category,
                    icon: definition.icon,
                    metadataSchema: definition.metadataSchema,
                  }}
                  onSuccess={() => {
                    setIsEditDefinition(false);
                    onClose();
                  }}
                  onCancel={() => setIsEditDefinition(false)}
                />
              ) : (
                <Tabs.Root
                  value={activeTab}
                  onValueChange={(e) => {
                    if (e.value === 'record' || e.value === 'definition') {
                      setActiveTab(e.value);
                    }
                  }}
                >
                  <Tabs.List>
                    <Tabs.Trigger value="record">Record</Tabs.Trigger>
                    {definition && <Tabs.Trigger value="definition">Definition</Tabs.Trigger>}
                  </Tabs.List>

                  <Tabs.Content value="record">
                    {isLoading ? (
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
                        {/* Record Info */}
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

                        {/* Metadata */}
                        {definition && definition.metadataSchema.length > 0 && (
                          <VStack align="flex-start" gap={2}>
                            <Heading fontSize="md" color="text.neon" fontFamily="mono">
                              Metadata
                            </Heading>
                            <VStack align="flex-start" gap={2} w="full">
                              {definition.metadataSchema.map((field) => {
                                const value = record.metadata[field.key];
                                return (
                                  <Box
                                    key={field.key}
                                    p={3}
                                    bg="bg.dark"
                                    borderRadius="4px"
                                    w="full"
                                  >
                                    <Text fontSize="sm" color="text.mist" fontWeight="bold">
                                      {field.name}
                                    </Text>
                                    <Text fontSize="sm" color="text.neon" fontFamily="mono" mt={1}>
                                      {value !== undefined && value !== null ? String(value) : '-'}
                                    </Text>
                                  </Box>
                                );
                              })}
                            </VStack>
                          </VStack>
                        )}

                        {/* Actions */}
                        <HStack gap={2} pt={4}>
                          <Button
                            size="sm"
                            variant="outline"
                            flex={1}
                            onClick={() => setIsEditMode(true)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => setShowDeleteDialog(true)}
                            loading={isDeleting}
                            flex={1}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </VStack>
                    )}
                  </Tabs.Content>

                  {definition && (
                    <Tabs.Content value="definition">
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
                          <VStack align="flex-start" gap={2}>
                            <Heading fontSize="md" color="text.neon" fontFamily="mono">
                              Metadata Schema
                            </Heading>
                            <VStack align="flex-start" gap={2} w="full">
                              {definition.metadataSchema.map((field) => (
                                <Box key={field.key} p={3} bg="bg.dark" borderRadius="4px" w="full">
                                  <Text fontSize="sm" color="text.mist" fontWeight="bold">
                                    {field.name} ({field.type})
                                  </Text>
                                  {field.required && (
                                    <Badge size="xs" colorPalette="red" mt={1}>
                                      Required
                                    </Badge>
                                  )}
                                </Box>
                              ))}
                            </VStack>
                          </VStack>
                        )}

                        <HStack gap={2} pt={4}>
                          <Button
                            size="sm"
                            variant="outline"
                            flex={1}
                            onClick={() => setIsEditDefinition(true)}
                          >
                            Edit Definition
                          </Button>
                        </HStack>
                      </VStack>
                    </Tabs.Content>
                  )}
                </Tabs.Root>
              )}
            </Drawer.Body>

            <Drawer.CloseTrigger />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColorScheme="red"
        isLoading={isDeleting}
      />
    </Drawer.Root>
  );
}
