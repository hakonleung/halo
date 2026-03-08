'use client';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  FieldRoot,
  FieldLabel,
  FieldHelperText,
  Select,
  createListCollection,
  Portal,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useSettings } from '@/client/hooks/use-settings';
import { useUpdateSettings } from '@/client/hooks/use-update-settings';
import { BackgroundType, RendererType } from '@/client/types/background-client';
import { checkWebGPUSupport } from '@/client/utils/webgpu-support';

const BACKGROUND_OPTIONS = [
  { value: BackgroundType.TRON_GRID, label: 'Tron Grid Wave (Recommended)' },
  { value: BackgroundType.MATRIX_RAIN, label: 'Matrix Rain' },
  { value: BackgroundType.PARTICLE_FIELD, label: 'Particle Field' },
  { value: BackgroundType.DATA_FLOW, label: 'Data Flow Lines' },
];

const RENDERER_OPTIONS = [
  { value: RendererType.AUTO, label: 'Auto Detect (Recommended)' },
  { value: RendererType.WEBGPU, label: 'WebGPU (High Performance)' },
  { value: RendererType.WEBGL, label: 'WebGL (Best Compatibility)' },
];

export function BackgroundSettings() {
  const { settings, isLoading } = useSettings();
  const { updateSettings, isLoading: isUpdating } = useUpdateSettings();
  const [webgpuSupported, setWebgpuSupported] = useState(false);

  const [backgroundType, setBackgroundType] = useState<BackgroundType>(BackgroundType.TRON_GRID);
  const [rendererType, setRendererType] = useState<RendererType>(RendererType.AUTO);

  useEffect(() => {
    void checkWebGPUSupport().then(setWebgpuSupported);
  }, []);

  // Sync form values when settings load
  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      setBackgroundType((settings.backgroundType as BackgroundType) ?? BackgroundType.TRON_GRID);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      setRendererType((settings.rendererType as RendererType) ?? RendererType.AUTO);
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings({
      backgroundType,
      rendererType,
    });
  };

  if (isLoading) {
    return (
      <Box p={6}>
        <Text color="text.mist" fontFamily="mono">
          [ LOADING... ]
        </Text>
      </Box>
    );
  }

  const backgroundCollection = createListCollection({ items: BACKGROUND_OPTIONS });
  const rendererCollection = createListCollection({ items: RENDERER_OPTIONS });

  return (
    <VStack gap={6} align="stretch" p={6}>
      <Heading color="text.neon" fontFamily="heading" mb={2}>
        Background Settings
      </Heading>

      <FieldRoot>
        <FieldLabel>Background Type</FieldLabel>
        <Select.Root
          collection={backgroundCollection}
          value={[backgroundType]}
          onValueChange={(e) => {
            const v = BACKGROUND_OPTIONS.find((t) => t.value === e.value[0])?.value;
            if (v) setBackgroundType(v);
          }}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {BACKGROUND_OPTIONS.map((option) => (
                  <Select.Item key={option.value} item={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </FieldRoot>

      <FieldRoot>
        <FieldLabel>Renderer</FieldLabel>
        <Select.Root
          collection={rendererCollection}
          value={[rendererType]}
          onValueChange={(e) => {
            const v = RENDERER_OPTIONS.find((t) => t.value === e.value[0])?.value;
            if (v) setRendererType(v);
          }}
        >
          <Select.Trigger>
            <Select.ValueText />
          </Select.Trigger>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {RENDERER_OPTIONS.map((option) => (
                  <Select.Item key={option.value} item={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
        <FieldHelperText>
          {webgpuSupported
            ? '✓ Your browser supports WebGPU (better performance)'
            : '✗ Your browser does not support WebGPU, will use WebGL'}
        </FieldHelperText>
      </FieldRoot>

      <HStack justify="flex-end" gap={4}>
        <Button onClick={handleSave} loading={isUpdating} disabled={isUpdating} variant="primary">
          Save
        </Button>
      </HStack>
    </VStack>
  );
}
