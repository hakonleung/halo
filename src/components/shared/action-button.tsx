'use client';

import { Drawer, Portal, Tabs } from '@chakra-ui/react';
import { RecordForm } from '@/components/behaviors/record-form';
import { GoalForm } from '@/components/goals';
import { NoteForm } from '@/components/log/note-form';
import { useActionDrawer } from './action-drawer-context';

export function ActionButton() {
  const { isOpen, activeTab, closeDrawer, setActiveTab } = useActionDrawer();

  const getTitle = () => {
    switch (activeTab) {
      case 'record':
        return 'NEW RECORD';
      case 'goal':
        return 'NEW GOAL';
      case 'note':
        return 'NEW NOTE';
      default:
        return 'NEW';
    }
  };

  return (
    <>
      {/* <Box position="fixed" bottom="24px" right="24px" zIndex={100}>
        <IconButton
          aria-label="Add recording"
          size="lg"
          width="56px"
          height="56px"
          borderRadius="full"
          bg="brand.matrix"
          color="bg.deep"
          _hover={{ bg: '#00cc33', boxShadow: '0 0 15px #00FF41' }}
          onClick={() => openDrawer('record')}
          boxShadow="0 0 10px rgba(0, 255, 65, 0.3)"
        >
          <Plus size={24} strokeWidth={3} />
        </IconButton>
      </Box> */}

      <Drawer.Root
        open={isOpen}
        onOpenChange={(e) => (e.open ? undefined : closeDrawer())}
        placement="end"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content width={{ base: 'full', md: '500px' }}>
              <Drawer.Header>
                <Drawer.Title>{getTitle()}</Drawer.Title>
              </Drawer.Header>

              <Drawer.Body>
                <Tabs.Root
                  value={activeTab}
                  onValueChange={(e) => {
                    const value = e.value;
                    if (value === 'record' || value === 'goal' || value === 'note') {
                      setActiveTab(value);
                    }
                  }}
                >
                  <Tabs.List>
                    <Tabs.Trigger value="record">Record</Tabs.Trigger>
                    <Tabs.Trigger value="goal">Goal</Tabs.Trigger>
                    <Tabs.Trigger value="note">Note</Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="record">
                    <RecordForm onSuccess={closeDrawer} onCancel={closeDrawer} />
                  </Tabs.Content>
                  <Tabs.Content value="goal">
                    <GoalForm onSuccess={closeDrawer} onCancel={closeDrawer} />
                  </Tabs.Content>
                  <Tabs.Content value="note">
                    <NoteForm onSuccess={closeDrawer} onCancel={closeDrawer} />
                  </Tabs.Content>
                </Tabs.Root>
              </Drawer.Body>

              <Drawer.CloseTrigger />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </>
  );
}
