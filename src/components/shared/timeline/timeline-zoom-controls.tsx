import { HStack, IconButton, Box, Text } from '@chakra-ui/react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import type { TimeUnit } from '@/types/timeline';

interface TimelineZoomControlsProps {
  currentTimeUnit: TimeUnit;
  currentLaneWidth: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

export function TimelineZoomControls({
  currentTimeUnit,
  currentLaneWidth,
  handleZoomIn,
  handleZoomOut,
  canZoomIn,
  canZoomOut,
}: TimelineZoomControlsProps) {
  return (
    <HStack
      position="absolute"
      top={4}
      right={0}
      zIndex={3}
      gap={0}
      backdropFilter="blur(2px)"
      fontSize="8px"
    >
      <IconButton
        aria-label="Zoom Out"
        size="xs"
        variant="ghost"
        color="brand.matrix"
        onClick={handleZoomOut}
        disabled={!canZoomOut}
      >
        <ZoomOut />
      </IconButton>
      <Box textAlign="center">
        <Text color="brand.matrix" fontFamily="mono" fontWeight="bold">
          {currentTimeUnit.toUpperCase()}
        </Text>
        <Text color="brand.matrix" fontFamily="mono">
          {currentLaneWidth}px
        </Text>
      </Box>
      <IconButton
        aria-label="Zoom In"
        size="xs"
        variant="ghost"
        color="brand.matrix"
        onClick={handleZoomIn}
        disabled={!canZoomIn}
      >
        <ZoomIn />
      </IconButton>
    </HStack>
  );
}
