'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Drawer,
  Portal,
  Flex,
  createToaster,
  Box,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuPositioner,
  IconButton,
} from '@chakra-ui/react';
import { Menu } from 'lucide-react';
import {
  useConversations,
  useChat,
  useDeleteConversation,
  useUpdateConversation,
} from '@/hooks/use-chat';
import { useChatUrlQuery } from '@/hooks/use-chat-url-query';
import { useSettings } from '@/hooks/use-settings';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ConversationList } from './conversation-list';
import { ChatHeader } from './chat-header';
import { ChatMessageArea } from './chat-message-area';
import { ChatInputBar } from './chat-input-bar';

const toaster = createToaster({
  placement: 'top',
});

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { conversations } = useConversations();
  const { conversationId, setConversationId } = useChatUrlQuery();
  const {
    messages,
    loadingMessages,
    sendMessage,
    status,
    error,
    conversationId: effectiveConversationId,
  } = useChat(conversationId);
  const { mutate: deleteConv } = useDeleteConversation();
  const { mutate: updateConv } = useUpdateConversation();
  const { settings } = useSettings();

  const [input, setInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStreaming = status === 'streaming' || status === 'submitted';

  // Compute current conversation title
  const currentTitle = conversationId
    ? conversations.find((c) => c.id === conversationId)?.title || 'New Conversation'
    : 'New Conversation';

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
      // Sync the effective conversation ID to URL after sending (avoids flash)
      if (!conversationId && effectiveConversationId) {
        setConversationId(effectiveConversationId);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleUpdateTitle = (id: string, title: string) => {
    updateConv(
      { conversationId: id, title },
      {
        onSuccess: () => {
          toaster.create({
            title: 'Title updated',
            type: 'success',
          });
        },
        onError: (err) => {
          toaster.create({
            title: 'Failed to update title',
            description: err.message,
            type: 'error',
          });
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    const idToDelete = deleteConfirmId;
    deleteConv(idToDelete, {
      onSuccess: () => {
        if (conversationId === idToDelete) {
          setConversationId(undefined);
        }
        setDeleteConfirmId(null);
        toaster.create({
          title: 'Conversation deleted',
          type: 'success',
        });
      },
      onError: (err) => {
        toaster.create({
          title: 'Failed to delete conversation',
          description: err.message,
          type: 'error',
        });
      },
    });
  };

  return (
    <>
      <Drawer.Root
        open={isOpen}
        onOpenChange={(e) => (!e.open ? onClose() : undefined)}
        size="full"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content display="flex" flexDirection="column" h="100vh">
              <Drawer.Header borderBottom="1px solid" borderColor="rgba(0, 255, 65, 0.2)">
                <ChatHeader
                  onClose={onClose}
                  title={currentTitle}
                  mobileMenuTrigger={
                    <Box display={{ base: 'block', md: 'none' }}>
                      <MenuRoot>
                        <MenuTrigger asChild>
                          <IconButton
                            aria-label="Open menu"
                            variant="ghost"
                            color="text.mist"
                            _hover={{ color: 'brand.matrix' }}
                          >
                            <Menu size={20} />
                          </IconButton>
                        </MenuTrigger>
                        <Portal>
                          <MenuPositioner>
                            <MenuContent w="280px">
                              <ConversationList
                                conversations={conversations}
                                selectedId={conversationId}
                                onSelect={setConversationId}
                                onNewChat={() => setConversationId(undefined)}
                                onUpdate={handleUpdateTitle}
                                onDelete={handleDelete}
                              />
                            </MenuContent>
                          </MenuPositioner>
                        </Portal>
                      </MenuRoot>
                    </Box>
                  }
                />
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
                  {/* Desktop Sidebar - Conversation List */}
                  <Box display={{ base: 'none', md: 'block' }}>
                    <ConversationList
                      conversations={conversations}
                      selectedId={conversationId}
                      onSelect={setConversationId}
                      onNewChat={() => setConversationId(undefined)}
                      onUpdate={handleUpdateTitle}
                      onDelete={handleDelete}
                    />
                  </Box>

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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="⚠️ DELETE CONVERSATION"
        message="Are you sure you want to delete this conversation? All messages will be lost. This action cannot be undone."
        confirmLabel="DELETE"
        cancelLabel="CANCEL"
        confirmColorScheme="red"
      />
    </>
  );
}
