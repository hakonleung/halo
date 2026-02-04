import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/hooks/use-settings';
import { AIProvider } from '@/types/settings-server';

export function useOpenChat() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { settings } = useSettings();

  const hasApiKey = useCallback(() => {
    if (!settings?.aiSettings) return false;
    const aiSettings = settings.aiSettings;

    if (aiSettings.useDefaultKey) {
      return true;
    }

    if (aiSettings.selectedProvider === AIProvider.Custom) {
      return (
        aiSettings.apiKey &&
        aiSettings.apiKey.trim() !== '' &&
        aiSettings.baseUrl &&
        aiSettings.baseUrl.trim() !== ''
      );
    }

    return aiSettings.selectedModel && aiSettings.selectedModel.trim() !== '';
  }, [settings?.aiSettings]);

  const openChat = useCallback(() => {
    if (hasApiKey()) {
      setIsOpen(true);
    } else {
      router.push('/settings?tab=ai');
    }
  }, [hasApiKey, router]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openChat,
    closeChat,
  };
}
