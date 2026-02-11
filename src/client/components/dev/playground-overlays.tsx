'use client';

import {
  Box,
  Button,
  Drawer,
  Flex,
  HStack,
  Menu,
  Popover,
  Switch,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';

import { SectionTitle } from './playground-shared';

interface Props {
  size: 'sm' | 'md' | 'lg';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
const V = (v: string) => v as any;

export function PlaygroundOverlays({ size }: Props) {
  return (
    <>
      {/* Menu */}
      <Box>
        <SectionTitle>Menu</SectionTitle>
        <Flex gap={3} wrap="wrap">
          <Menu.Root size={size}>
            <Menu.Trigger asChild>
              <Button variant={V('secondary')} size={size}>
                Open Menu
              </Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item value="new">New File</Menu.Item>
              <Menu.Item value="open">Open</Menu.Item>
              <Menu.Separator />
              <Menu.Item value="delete" color="semantic.error">
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Flex>
      </Box>

      {/* Popover */}
      <Box>
        <SectionTitle>Popover</SectionTitle>
        <Flex gap={3} wrap="wrap">
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button variant={V('secondary')} size={size}>
                Open Popover
              </Button>
            </Popover.Trigger>
            <Popover.Content>
              <Popover.Header>System Info</Popover.Header>
              <Popover.Body>
                <Text fontFamily="mono" fontSize="12px" color="text.mist">
                  NEO-LOG v1.0 — All systems nominal
                </Text>
              </Popover.Body>
            </Popover.Content>
          </Popover.Root>
        </Flex>
      </Box>

      {/* Drawer */}
      <Box>
        <SectionTitle>Drawer</SectionTitle>
        <Flex gap={3} wrap="wrap">
          {(['sm', 'md', 'lg'] as const).map((drawerSize) => (
            <Drawer.Root key={drawerSize} size={drawerSize}>
              <Drawer.Trigger asChild>
                <Button variant={V('secondary')} size={size}>
                  Drawer {drawerSize}
                </Button>
              </Drawer.Trigger>
              <Drawer.Backdrop />
              <Drawer.Positioner>
                <Drawer.Content>
                  <Drawer.Header>
                    <Drawer.Title>Drawer — size=&quot;{drawerSize}&quot;</Drawer.Title>
                    <Drawer.CloseTrigger />
                  </Drawer.Header>
                  <Drawer.Body>
                    <Text fontFamily="mono" fontSize="14px" color="text.mist">
                      Drawer content preview
                    </Text>
                  </Drawer.Body>
                </Drawer.Content>
              </Drawer.Positioner>
            </Drawer.Root>
          ))}
        </Flex>
      </Box>

      {/* Tabs */}
      <Box>
        <SectionTitle>Tabs</SectionTitle>
        <VStack gap={4} align="stretch">
          <Tabs.Root variant="line" size={size} defaultValue="tab1">
            <Tabs.List>
              <Tabs.Trigger value="tab1">Timeline</Tabs.Trigger>
              <Tabs.Trigger value="tab2">Dashboard</Tabs.Trigger>
              <Tabs.Trigger value="tab3">Settings</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="tab1">
              <Text color="text.mist" fontFamily="mono" fontSize="14px">
                Line tab content
              </Text>
            </Tabs.Content>
          </Tabs.Root>
          <Tabs.Root variant="enclosed" size={size} defaultValue="tab1">
            <Tabs.List>
              <Tabs.Trigger value="tab1">Profile</Tabs.Trigger>
              <Tabs.Trigger value="tab2">Appearance</Tabs.Trigger>
              <Tabs.Trigger value="tab3">AI</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="tab1">
              <Text color="text.mist" fontFamily="mono" fontSize="14px">
                Enclosed tab content
              </Text>
            </Tabs.Content>
          </Tabs.Root>
        </VStack>
      </Box>

      {/* Switch */}
      <Box>
        <SectionTitle>Switch</SectionTitle>
        <HStack gap={6}>
          <Switch.Root size={size}>
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>Off</Switch.Label>
          </Switch.Root>
          <Switch.Root size={size} defaultChecked>
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>On</Switch.Label>
          </Switch.Root>
        </HStack>
      </Box>
    </>
  );
}
