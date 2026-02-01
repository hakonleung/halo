'use client';

import { useState, useEffect } from 'react';
import { Drawer, Portal, VStack, HStack, Button, Text, Box } from '@chakra-ui/react';
import { Editor } from './editor';
import { useEditorModalStore } from '@/store/editor-modal-store';

export function EditorModal() {
  const { isOpen, value, placeholder, title, onChange, onSave, closeModal } = useEditorModalStore();
  const [localValue, setLocalValue] = useState(value);
  const [mode, setMode] = useState<'markdown' | 'rich'>('rich');

  // 同步外部 value 变化
  useEffect(() => {
    if (isOpen) {
      setLocalValue(value);
    }
  }, [value, isOpen]);

  const handleSave = () => {
    if (onChange) {
      onChange(localValue);
    }
    if (onSave) {
      onSave(localValue);
    }
    closeModal();
  };

  const handleClose = () => {
    // 关闭时恢复原始值
    setLocalValue(value);
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={(e) => (!e.open ? handleClose() : undefined)}
      size="full"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content display="flex" flexDirection="column">
            <Drawer.Header borderBottomWidth="1px" borderColor="border.subtle">
              <HStack justify="space-between" align="center" w="full">
                <Drawer.Title>{title}</Drawer.Title>
                <Text fontSize="xs" color="text.dim">
                  {mode === 'markdown' ? 'Markdown' : 'Rich Text'} Mode
                </Text>
              </HStack>
            </Drawer.Header>

            <Drawer.Body flex={1} overflow="hidden" p={6}>
              <VStack gap={4} h="full" align="stretch">
                <Box flex={1} overflow="hidden" minH={0}>
                  <Editor
                    value={localValue}
                    onChange={setLocalValue}
                    placeholder={placeholder}
                    mode={mode}
                    onModeChange={setMode}
                  />
                </Box>
              </VStack>
            </Drawer.Body>

            <Drawer.Footer borderTopWidth="1px" borderColor="border.subtle">
              <HStack gap={4} w="full" justify="flex-end">
                <Button variant="ghost" onClick={handleClose}>
                  CANCEL
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  SAVE
                </Button>
              </HStack>
            </Drawer.Footer>

            <Drawer.CloseTrigger />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
