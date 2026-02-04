'use client';

import { Drawer, Portal, Flex } from '@chakra-ui/react';
import { useState, useRef, useEffect, useMemo } from 'react';

import { useChat } from '@/client/components/chat/use-chat';
import { useSettings } from '@/client/hooks/use-settings';

import { ChatHeader } from './chat-header';
import { ChatInputBar } from './chat-input-bar';
import { ChatMessageArea } from './chat-message-area';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { messages, loadingMessages, sendMessage, status, error } = useChat();
  const { settings } = useSettings();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Compute agent name from settings
  const agentName = useMemo(() => {
    return settings?.username || 'NEO';
  }, [settings?.username]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const content = input;
    setInput('');
    try {
      await sendMessage({ text: content });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(e) => (!e.open ? onClose() : undefined)} size="full">
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content display="flex" flexDirection="column" h="100vh">
            <Drawer.Header borderBottom="1px solid" borderColor="rgba(0, 255, 65, 0.2)">
              <ChatHeader onClose={onClose} />
            </Drawer.Header>

            <Drawer.Body
              flex={1}
              overflow="hidden"
              p={0}
              display="flex"
              flexDirection="column"
              h="calc(100vh - 64px)"
            >
              <Flex h="full" bg="transparent" position="relative" zIndex={1}>
                {/* Main Chat Area */}
                <Flex flex={1} direction="column" h="full" position="relative">
                  <ChatMessageArea
                    ref={messagesEndRef}
                    messages={messages}
                    loading={loadingMessages}
                    isStreaming={isStreaming}
                    error={error ?? null}
                    agentName={agentName}
                  />

                  <ChatInputBar
                    value={input}
                    onChange={setInput}
                    onSend={handleSend}
                    disabled={isStreaming}
                  />
                </Flex>
              </Flex>
            </Drawer.Body>

            <Drawer.CloseTrigger />
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
