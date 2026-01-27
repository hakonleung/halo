'use client';

import { useState } from 'react';
import { Box, IconButton, Drawer, Portal } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { RecordForm } from '@/components/behaviors/record-form';

export function ActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

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
          onClick={() => setIsOpen(true)}
          boxShadow="0 0 10px rgba(0, 255, 65, 0.3)"
        >
          <Plus size={24} strokeWidth={3} />
        </IconButton>
      </Box>

      <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="end">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content width={{ base: 'full', md: '420px' }}>
              <Drawer.Header>
                <Drawer.Title>NEW RECORD</Drawer.Title>
              </Drawer.Header>

              <Drawer.Body>
                <RecordForm onSuccess={handleClose} onCancel={handleClose} />
              </Drawer.Body>

              <Drawer.CloseTrigger />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
}
