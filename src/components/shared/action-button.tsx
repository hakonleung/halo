'use client';

import { useState } from 'react';
import { Box, IconButton, Drawer, HStack, Button } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { RecordForm } from '@/components/behaviors/record-form';
import { DefinitionForm } from '@/components/behaviors/definition-form';

type ViewMode = 'record' | 'definition';

export function ActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('record');

  const handleOpen = () => {
    setViewMode('record');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset to record mode when closing
    setTimeout(() => setViewMode('record'), 300);
  };

  return (
    <>
      <Box position="fixed" bottom="24px" right="24px" zIndex={100}>
        <IconButton
          aria-label="Add recording"
          size="lg"
          width="56px"
          height="56px"
          borderRadius="full"
          bg="brand.matrix"
          color="bg.deep"
          _hover={{ bg: '#00cc33', boxShadow: '0 0 15px #00FF41' }}
          onClick={handleOpen}
          boxShadow="0 0 10px rgba(0, 255, 65, 0.3)"
        >
          <Plus size={24} strokeWidth={3} />
        </IconButton>
      </Box>

      <Drawer.Root
        open={isOpen}
        onOpenChange={(e) => (e.open ? handleOpen() : handleClose())}
        placement="end"
      >
        <Drawer.Backdrop />
        <Drawer.Positioner width={{ base: 'full', md: '420px' }}>
          <Drawer.Content
            bg="bg.carbon"
            borderLeft="1px solid"
            borderColor="brand.matrix"
            height="100vh"
          >
            <Drawer.Header borderBottom="1px solid" borderColor="rgba(0, 255, 65, 0.2)" py={6}>
              <Drawer.Title
                color="brand.matrix"
                fontFamily="heading"
                textShadow="0 0 8px currentColor"
                mb={4}
              >
                {viewMode === 'record' ? 'NEW RECORD' : 'NEW DEFINITION'}
              </Drawer.Title>
              <HStack gap={2}>
                <Button
                  size="sm"
                  variant={viewMode === 'record' ? 'solid' : 'outline'}
                  colorScheme={viewMode === 'record' ? 'green' : undefined}
                  onClick={() => setViewMode('record')}
                  fontFamily="mono"
                  fontSize="xs"
                >
                  RECORD
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'definition' ? 'solid' : 'outline'}
                  colorScheme={viewMode === 'definition' ? 'green' : undefined}
                  onClick={() => setViewMode('definition')}
                  fontFamily="mono"
                  fontSize="xs"
                >
                  DEFINITION
                </Button>
              </HStack>
            </Drawer.Header>

            <Drawer.Body py={8}>
              {viewMode === 'record' ? (
                <RecordForm onSuccess={handleClose} onCancel={handleClose} />
              ) : (
                <DefinitionForm onSuccess={handleClose} onCancel={handleClose} />
              )}
            </Drawer.Body>

            <Drawer.CloseTrigger
              color="text.mist"
              _hover={{ color: 'brand.matrix' }}
              top={4}
              right={4}
            />
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  );
}
