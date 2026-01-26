'use client';

import { Box, VStack, Heading, HStack, Button } from '@chakra-ui/react';
import { ProfileSettings } from './profile-settings';
import { AppearanceSettings } from './appearance-settings';
import { NotificationSettings } from './notification-settings';
import { LocaleSettings } from './locale-settings';
import { useState } from 'react';

enum SettingsTab {
  Profile = 'profile',
  Appearance = 'appearance',
  Notifications = 'notifications',
  Locale = 'locale',
}

export function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.Profile);

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: SettingsTab.Profile, label: 'Profile' },
    { id: SettingsTab.Appearance, label: 'Appearance' },
    { id: SettingsTab.Notifications, label: 'Notifications' },
    { id: SettingsTab.Locale, label: 'Locale' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case SettingsTab.Profile:
        return <ProfileSettings />;
      case SettingsTab.Appearance:
        return <AppearanceSettings />;
      case SettingsTab.Notifications:
        return <NotificationSettings />;
      case SettingsTab.Locale:
        return <LocaleSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <Box p={8}>
      <VStack gap={8} align="stretch" maxW="container.lg" mx="auto">
        <Heading
          as="h1"
          size="2xl"
          color="brand.matrix"
          fontFamily="heading"
          textShadow="0 0 10px currentColor"
        >
          SETTINGS
        </Heading>

        <Box
          bg="bg.carbon"
          border="1px solid"
          borderColor="brand.matrix"
          borderRadius="4px"
          p={6}
          boxShadow="0 0 15px rgba(0, 255, 65, 0.1)"
        >
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
                size="sm"
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
        </Box>
      </VStack>
    </Box>
  );
}
