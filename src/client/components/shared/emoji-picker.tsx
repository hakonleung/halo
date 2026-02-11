'use client';

import { Box, Input, Portal, Popover } from '@chakra-ui/react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useState, useEffect, useRef } from 'react';
import { LuSmile } from 'react-icons/lu';

import { RAW_COLORS } from '@/client/theme/tokens';

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
        emojiMartRoot.style.setProperty('--bg', RAW_COLORS.bgCarbon);
        emojiMartRoot.style.setProperty('--bg-hover', RAW_COLORS.matrix10);
        emojiMartRoot.style.setProperty('--fg', RAW_COLORS.textNeon);
        emojiMartRoot.style.setProperty('--fg-secondary', RAW_COLORS.textMist);
        emojiMartRoot.style.setProperty('--border', RAW_COLORS.matrix30);
        emojiMartRoot.style.setProperty('--shadow', RAW_COLORS.matrix10);
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
            bg="black/30"
            borderColor="matrix/20"
            _focus={{
              borderColor: 'brand.matrix',
              boxShadow: 'badge',
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
                  backgroundColor: RAW_COLORS.bgCarbon,
                  border: `1px solid ${RAW_COLORS.matrix30}`,
                  borderRadius: '4px',
                  boxShadow: RAW_COLORS.matrix10,
                  fontFamily: 'mono',
                },
                '& .emoji-mart-search input': {
                  backgroundColor: RAW_COLORS.black30,
                  borderColor: RAW_COLORS.matrix20,
                  color: RAW_COLORS.textNeon,
                },
                '& .emoji-mart-search input:focus': {
                  borderColor: RAW_COLORS.matrix,
                  boxShadow: RAW_COLORS.matrix10,
                },
                '& .emoji-mart-category-label span': {
                  color: RAW_COLORS.textMist,
                },
                '& .emoji-mart-emoji:hover': {
                  backgroundColor: RAW_COLORS.matrix10,
                },
                '& .emoji-mart-bar': {
                  borderColor: RAW_COLORS.matrix20,
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
