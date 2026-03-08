/**
 * Speech Bubble Component
 *
 * HTML overlay input box that appears above the character model.
 */

import { Box, Input, HStack } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

import { CHARACTER_CONFIG } from './configs';

interface SpeechBubbleProps {
  camera: THREE.Camera | null;
  visible: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
}

export function SpeechBubble({ camera, visible, onSend, onClose }: SpeechBubbleProps) {
  const [input, setInput] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate screen position of character head
  useEffect(() => {
    if (!camera || !visible) return;

    const updatePosition = () => {
      // Character head position in world space
      const characterPos = new THREE.Vector3(
        CHARACTER_CONFIG.position.x,
        CHARACTER_CONFIG.position.y + 2.0, // Above character head
        CHARACTER_CONFIG.position.z,
      );

      // Project to screen space
      const screenPos = characterPos.project(camera);

      // Convert from NDC (-1 to +1) to pixel coordinates
      const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

      setPosition({ x, y });
    };

    updatePosition();

    // Update on window resize
    window.addEventListener('resize', updatePosition);

    // Update on animation frame (if camera moves)
    const interval = setInterval(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      clearInterval(interval);
    };
  }, [camera, visible]);

  // Focus input when visible
  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  // Handle click outside to close
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const target = event.target as HTMLElement;
      if (!target.closest('[data-speech-bubble]')) {
        onClose();
      }
    };

    // Delay to avoid immediate close from the click that opened it
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [visible, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      onSend(input);
      setInput('');
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Box
      data-speech-bubble
      position="fixed"
      left={`${position.x}px`}
      top={`${position.y - 60}px`} // Offset above character
      transform="translateX(-50%)"
      zIndex={1000}
      pointerEvents="auto"
    >
      {/* Speech bubble container */}
      <Box
        bg="rgba(0, 255, 65, 0.1)"
        borderWidth="1px"
        borderColor="brand.matrix"
        borderRadius="md"
        p={2}
        minW="300px"
        boxShadow="0 0 15px rgba(0, 255, 65, 0.3)"
        backdropFilter="blur(10px)"
        position="relative"
      >
        {/* Tail pointing down to character */}
        <Box
          position="absolute"
          bottom="-10px"
          left="50%"
          transform="translateX(-50%)"
          width={0}
          height={0}
          borderLeft="10px solid transparent"
          borderRight="10px solid transparent"
          borderTop="10px solid"
          borderTopColor="brand.matrix"
        />

        <HStack gap={2}>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            size="sm"
            variant="outline"
            bg="bg.deep"
            borderColor="brand.matrix"
            color="text.neon"
            _placeholder={{ color: 'text.mist' }}
            _focus={{
              borderColor: 'brand.cyber',
              boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
            }}
          />
        </HStack>

        {/* Helper text */}
        <Box mt={1} fontSize="xs" color="text.mist" textAlign="center">
          Press Enter to send, Esc to close
        </Box>
      </Box>
    </Box>
  );
}
