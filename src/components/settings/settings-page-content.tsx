'use client';

import { Box, VStack, Heading, HStack, Button } from '@chakra-ui/react';
import { ProfileSettings } from './profile-settings';
import { AppearanceSettings } from './appearance-settings';
import { NotificationSettings } from './notification-settings';
import { LocaleSettings } from './locale-settings';
import { useState } from 'react';

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'locale';

export function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'profile', label: 'Profile' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'locale', label: 'Locale' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'locale':
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
