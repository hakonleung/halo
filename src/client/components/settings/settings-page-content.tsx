'use client';

import { Box, VStack, HStack, Button, Card } from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';

import { FeatureFlag, isFeatureEnabled } from '@/client/utils/feature-flags';

import { AISettingsComponent } from './ai-settings';
import { AppearanceSettings } from './appearance-settings';
import { LocaleSettings } from './locale-settings';
import { NotificationSettings } from './notification-settings';
import { ProfileSettings } from './profile-settings';

enum SettingsTab {
  Profile = 'profile',
  Appearance = 'appearance',
  Notifications = 'notifications',
  Locale = 'locale',
  AI = 'ai',
}

export function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.Profile);

  const isNotificationsEnabled = isFeatureEnabled(FeatureFlag.Notifications);

  const tabs: Array<{ id: SettingsTab; label: string }> = useMemo(() => {
    const allTabs: Array<{ id: SettingsTab; label: string }> = [
      { id: SettingsTab.Profile, label: 'Profile' },
      { id: SettingsTab.Appearance, label: 'Appearance' },
      { id: SettingsTab.Notifications, label: 'Notifications' },
      { id: SettingsTab.Locale, label: 'Locale' },
      { id: SettingsTab.AI, label: 'AI' },
    ];

    return allTabs.filter((tab) => {
      if (tab.id === SettingsTab.Notifications) {
        return isNotificationsEnabled;
      }
      return true;
    });
  }, [isNotificationsEnabled]);

  // If notifications is disabled and current tab is notifications, switch to first available tab
  useEffect(() => {
    if (!isNotificationsEnabled && activeTab === SettingsTab.Notifications) {
      setActiveTab(tabs[0]?.id ?? SettingsTab.Profile);
    }
  }, [isNotificationsEnabled, activeTab, tabs]);

  const renderContent = () => {
    switch (activeTab) {
      case SettingsTab.Profile:
        return <ProfileSettings />;
      case SettingsTab.Appearance:
        return <AppearanceSettings />;
      case SettingsTab.Notifications:
        if (!isNotificationsEnabled) {
          return <ProfileSettings />;
        }
        return <NotificationSettings />;
      case SettingsTab.Locale:
        return <LocaleSettings />;
      case SettingsTab.AI:
        return <AISettingsComponent />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <Box p={8}>
      <VStack gap={8} align="stretch" maxW="container.lg" mx="auto">
        <Card.Root borderColor="brand.matrix">
          <Card.Body>
            <HStack
              gap={2}
              borderBottom="1px solid"
              borderColor="brand.matrix"
              pb={4}
              mb={6}
              flexWrap="wrap"
            >
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  color={activeTab === tab.id ? 'brand.matrix' : 'text.mist'}
                  borderBottom={activeTab === tab.id ? '2px solid' : 'none'}
                  borderColor={activeTab === tab.id ? 'brand.matrix' : 'transparent'}
                  borderRadius={0}
                  fontFamily="mono"
                  fontSize="sm"
                  _hover={{
                    color: 'brand.matrix',
                    bg: 'transparent',
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </HStack>

            {renderContent()}
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}
