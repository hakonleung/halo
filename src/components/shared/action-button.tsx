'use client';

import { Drawer, Portal, Tabs } from '@chakra-ui/react';
import { RecordForm } from '@/components/behaviors/record-form';
import { GoalForm, NoteForm } from '@/components/forms';
import { useActionDrawerStore } from '@/store/action-drawer-store';
import { ActionDrawerTab } from '@/types/drawer';

export function ActionButton() {
  const { isOpen, activeTab, closeDrawer, setActiveTab } = useActionDrawerStore();

  const getTitle = () => {
    switch (activeTab) {
      case ActionDrawerTab.Record:
        return 'NEW RECORD';
      case ActionDrawerTab.Goal:
        return 'NEW GOAL';
      case ActionDrawerTab.Note:
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
                    if (
                      value === ActionDrawerTab.Record ||
                      value === ActionDrawerTab.Goal ||
                      value === ActionDrawerTab.Note
                    ) {
                      setActiveTab(value);
                    }
                  }}
                >
                  <Tabs.List>
                    <Tabs.Trigger value={ActionDrawerTab.Record}>Record</Tabs.Trigger>
                    <Tabs.Trigger value={ActionDrawerTab.Goal}>Goal</Tabs.Trigger>
                    <Tabs.Trigger value={ActionDrawerTab.Note}>Note</Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value={ActionDrawerTab.Record}>
                    <RecordForm onSuccess={closeDrawer} onCancel={closeDrawer} />
                  </Tabs.Content>
                  <Tabs.Content value={ActionDrawerTab.Goal}>
                    <GoalForm onSuccess={closeDrawer} onCancel={closeDrawer} />
                  </Tabs.Content>
                  <Tabs.Content value={ActionDrawerTab.Note}>
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
