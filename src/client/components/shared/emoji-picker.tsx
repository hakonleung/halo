'use client';

import { Box, Input, Portal, Popover } from '@chakra-ui/react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useState, useEffect, useRef } from 'react';
import { LuSmile } from 'react-icons/lu';

export function EmojiPicker({
  value,
  onChange,
  placeholder = 'Select emoji',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && pickerRef.current) {
      // Apply custom styles to emoji-mart picker using CSS variables
      const emojiMartRoot = pickerRef.current.querySelector('.emoji-mart');
      if (emojiMartRoot && emojiMartRoot instanceof HTMLElement) {
        emojiMartRoot.style.setProperty('--bg', '#1A1A1A');
        emojiMartRoot.style.setProperty('--bg-hover', 'rgba(0, 255, 65, 0.1)');
        emojiMartRoot.style.setProperty('--fg', '#E0E0E0');
        emojiMartRoot.style.setProperty('--fg-secondary', '#888888');
        emojiMartRoot.style.setProperty('--border', 'rgba(0, 255, 65, 0.3)');
        emojiMartRoot.style.setProperty('--shadow', '0 0 20px rgba(0, 255, 65, 0.1)');
      }
    }
  }, [isOpen]);

  return (
    <Popover.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
      <Popover.Trigger asChild>
        <Box position="relative" display="inline-block" w="full">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            pl="10"
            bg="rgba(0, 0, 0, 0.3)"
            borderColor="rgba(0, 255, 65, 0.2)"
            _focus={{
              borderColor: 'brand.matrix',
              boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
            }}
            fontFamily="mono"
            readOnly
            cursor="pointer"
            onClick={() => setIsOpen(true)}
          />
          <Box
            position="absolute"
            left="3"
            top="50%"
            transform="translateY(-50%)"
            color="brand.matrix"
            cursor="pointer"
            pointerEvents="none"
          >
            <LuSmile size={14} />
          </Box>
        </Box>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content
            bg="transparent"
            border="none"
            p="0"
            boxShadow="none"
            zIndex="popover"
            w="auto"
          >
            <Box
              ref={pickerRef}
              css={{
                '& .emoji-mart': {
                  backgroundColor: '#1A1A1A',
                  border: '1px solid rgba(0, 255, 65, 0.3)',
                  borderRadius: '4px',
                  boxShadow: '0 0 20px rgba(0, 255, 65, 0.1)',
                  fontFamily: 'mono',
                },
                '& .emoji-mart-search input': {
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderColor: 'rgba(0, 255, 65, 0.2)',
                  color: '#E0E0E0',
                },
                '& .emoji-mart-search input:focus': {
                  borderColor: '#00FF41',
                  boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
                },
                '& .emoji-mart-category-label span': {
                  color: '#888888',
                },
                '& .emoji-mart-emoji:hover': {
                  backgroundColor: 'rgba(0, 255, 65, 0.1)',
                },
                '& .emoji-mart-bar': {
                  borderColor: 'rgba(0, 255, 65, 0.2)',
                },
              }}
            >
              <Picker
                data={data}
                onEmojiSelect={(emoji: { native: string }) => {
                  onChange(emoji.native);
                  setIsOpen(false);
                }}
                theme="dark"
                set="native"
                previewPosition="none"
                skinTonePosition="none"
              />
            </Box>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
