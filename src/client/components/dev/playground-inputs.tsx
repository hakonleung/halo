'use client';

import {
  Box,
  createListCollection,
  Field,
  Flex,
  Input,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { SectionTitle } from './playground-shared';

interface Props {
  size: 'sm' | 'md' | 'lg';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
const V = (v: string) => v as any;

const selectItems = createListCollection({
  items: [
    { label: 'Matrix Green', value: 'matrix' },
    { label: 'Alert Orange', value: 'alert' },
    { label: 'Cyber Blue', value: 'cyber' },
  ],
});

export function PlaygroundInputs({ size }: Props) {
  return (
    <>
      {/* Inputs */}
      <Box>
        <SectionTitle>Inputs</SectionTitle>
        <VStack gap={3} align="stretch">
          <Flex gap={3} wrap="wrap">
            <Input
              variant="outline"
              size={size}
              placeholder="Outline variant"
              flex="1"
              minW="200px"
            />
            <Input
              variant={V('solid')}
              size={size}
              placeholder="Solid variant"
              flex="1"
              minW="200px"
            />
            <Input
              variant="subtle"
              size={size}
              placeholder="Subtle variant"
              flex="1"
              minW="200px"
            />
          </Flex>
          <Textarea
            variant="outline"
            size={size}
            placeholder="Textarea with outline variant"
            rows={3}
          />
        </VStack>
      </Box>

      {/* Select */}
      <Box>
        <SectionTitle>Select</SectionTitle>
        <Flex gap={3} wrap="wrap">
          <Box flex="1" minW="200px">
            <Select.Root size={size} collection={selectItems}>
              <Select.Trigger>
                <Select.ValueText placeholder="Choose a color" />
              </Select.Trigger>
              <Select.Content>
                {selectItems.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
      </Box>

      {/* Field */}
      <Box>
        <SectionTitle>Field</SectionTitle>
        <VStack gap={4} align="stretch" maxW="400px">
          <Field.Root>
            <Field.Label>Username</Field.Label>
            <Input variant="outline" size={size} placeholder="Enter username" />
            <Field.HelperText>Helper text for guidance</Field.HelperText>
          </Field.Root>
          <Field.Root invalid>
            <Field.Label>Email</Field.Label>
            <Input variant="outline" size={size} placeholder="Enter email" />
            <Field.ErrorText>Invalid email address</Field.ErrorText>
          </Field.Root>
        </VStack>
      </Box>
    </>
  );
}
