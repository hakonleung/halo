'use client';

import {
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Box,
  Input,
  FieldRoot,
  FieldLabel,
} from '@chakra-ui/react';
import { useSettings } from '@/hooks/use-settings';
import { useUpdateSettings } from '@/hooks/use-update-settings';
import { useState, useEffect } from 'react';
import { validateDoNotDisturbTimeRange } from '@/utils/settings-pure';

export function NotificationSettings() {
  const { settings, isLoading } = useSettings();
  const { updateSettings, isLoading: isUpdating } = useUpdateSettings();

  const [notificationsInApp, setNotificationsInApp] = useState(true);
  const [notificationsPush, setNotificationsPush] = useState(false);
  const [notificationsEmail, setNotificationsEmail] = useState(false);
  const [goalReminderEnabled, setGoalReminderEnabled] = useState(true);
  const [recordReminderEnabled, setRecordReminderEnabled] = useState(false);
  const [insightsEnabled, setInsightsEnabled] = useState(true);
  const [doNotDisturbStart, setDoNotDisturbStart] = useState<string>('');
  const [doNotDisturbEnd, setDoNotDisturbEnd] = useState<string>('');
  const [doNotDisturbWeekends, setDoNotDisturbWeekends] = useState(false);
  const [timeRangeError, setTimeRangeError] = useState<string | null>(null);

  // Sync form values when settings load
  useEffect(() => {
    if (settings) {
      setNotificationsInApp(settings.notificationsInApp ?? true);
      setNotificationsPush(settings.notificationsPush ?? false);
      setNotificationsEmail(settings.notificationsEmail ?? false);
      setGoalReminderEnabled(settings.goalReminderEnabled ?? true);
      setRecordReminderEnabled(settings.recordReminderEnabled ?? false);
      setInsightsEnabled(settings.insightsEnabled ?? true);
      setDoNotDisturbStart(settings.doNotDisturbStart || '');
      setDoNotDisturbEnd(settings.doNotDisturbEnd || '');
      setDoNotDisturbWeekends(settings.doNotDisturbWeekends ?? false);
    }
  }, [settings]);

  const handleSave = async () => {
    // Validate do not disturb time range
    const timeRangeValidation = validateDoNotDisturbTimeRange(
      doNotDisturbStart || null,
      doNotDisturbEnd || null,
    );
    if (timeRangeValidation) {
      setTimeRangeError(timeRangeValidation);
      return;
    }
    setTimeRangeError(null);

    await updateSettings({
      notificationsInApp: notificationsInApp,
      notificationsPush: notificationsPush,
      notificationsEmail: notificationsEmail,
      goalReminderEnabled: goalReminderEnabled,
      recordReminderEnabled: recordReminderEnabled,
      insightsEnabled: insightsEnabled,
      doNotDisturbStart: doNotDisturbStart || undefined,
      doNotDisturbEnd: doNotDisturbEnd || undefined,
      doNotDisturbWeekends: doNotDisturbWeekends,
    });
  };

  if (isLoading) {
    return (
      <Box p={6}>
        <Text color="text.mist" fontFamily="mono">
          [ LOADING... ]
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch" p={6}>
      <Heading size="md" color="text.neon" fontFamily="heading" mb={2}>
        Notification Settings
      </Heading>

      <Box>
        <Heading size="sm" color="text.mist" fontFamily="mono" mb={4}>
          Notification Channels
        </Heading>
        <VStack gap={3} align="stretch">
          <HStack justify="space-between">
            <Text color="text.mist" fontFamily="mono" fontSize="sm">
              In-App Notifications
            </Text>
            <Button
              size="sm"
              variant={notificationsInApp ? 'toggle-active' : 'toggle'}
              onClick={() => setNotificationsInApp(!notificationsInApp)}
              minW="60px"
            >
              {notificationsInApp ? 'ON' : 'OFF'}
            </Button>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.mist" fontFamily="mono" fontSize="sm">
              Push Notifications
            </Text>
            <Button
              size="sm"
              variant={notificationsPush ? 'toggle-active' : 'toggle'}
              onClick={() => setNotificationsPush(!notificationsPush)}
              minW="60px"
            >
              {notificationsPush ? 'ON' : 'OFF'}
            </Button>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.mist" fontFamily="mono" fontSize="sm">
              Email Notifications
            </Text>
            <Button
              size="sm"
              variant={notificationsEmail ? 'toggle-active' : 'toggle'}
              onClick={() => setNotificationsEmail(!notificationsEmail)}
              minW="60px"
            >
              {notificationsEmail ? 'ON' : 'OFF'}
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box>
        <Heading size="sm" color="text.mist" fontFamily="mono" mb={4}>
          Reminders
        </Heading>
        <VStack gap={3} align="stretch">
          <HStack justify="space-between">
            <Text color="text.mist" fontFamily="mono" fontSize="sm">
              Goal Reminders
            </Text>
            <Button
              size="sm"
              variant={goalReminderEnabled ? 'toggle-active' : 'toggle'}
              onClick={() => setGoalReminderEnabled(!goalReminderEnabled)}
              minW="60px"
            >
              {goalReminderEnabled ? 'ON' : 'OFF'}
            </Button>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.mist" fontFamily="mono" fontSize="sm">
              Record Reminders
            </Text>
            <Button
              size="sm"
              variant={recordReminderEnabled ? 'toggle-active' : 'toggle'}
              onClick={() => setRecordReminderEnabled(!recordReminderEnabled)}
              minW="60px"
            >
              {recordReminderEnabled ? 'ON' : 'OFF'}
            </Button>
          </HStack>
          <HStack justify="space-between">
            <Text color="text.mist" fontFamily="mono" fontSize="sm">
              Insights Notifications
            </Text>
            <Button
              size="sm"
              variant={insightsEnabled ? 'toggle-active' : 'toggle'}
              onClick={() => setInsightsEnabled(!insightsEnabled)}
              minW="60px"
            >
              {insightsEnabled ? 'ON' : 'OFF'}
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box>
        <Heading size="sm" color="text.mist" fontFamily="mono" mb={4}>
          Do Not Disturb
        </Heading>
        <VStack gap={3} align="stretch">
          <HStack gap={2}>
            <FieldRoot flex={1}>
              <FieldLabel>Start Time</FieldLabel>
              <Input
                type="time"
                value={doNotDisturbStart}
                onChange={(e) => setDoNotDisturbStart(e.target.value)}
                borderColor={timeRangeError ? 'red.500' : undefined}
              />
            </FieldRoot>
            <FieldRoot flex={1}>
              <FieldLabel>End Time</FieldLabel>
              <Input
                type="time"
                value={doNotDisturbEnd}
                onChange={(e) => setDoNotDisturbEnd(e.target.value)}
                borderColor={timeRangeError ? 'red.500' : undefined}
              />
            </FieldRoot>
          </HStack>
          {timeRangeError && (
            <Text fontSize="xs" color="red.500" fontFamily="mono">
              {timeRangeError}
            </Text>
          )}
          <HStack justify="space-between">
            <Text color="text.mist" fontFamily="mono" fontSize="sm">
              Weekends
            </Text>
            <Button
              size="sm"
              variant={doNotDisturbWeekends ? 'toggle-active' : 'toggle'}
              onClick={() => setDoNotDisturbWeekends(!doNotDisturbWeekends)}
              minW="60px"
            >
              {doNotDisturbWeekends ? 'ON' : 'OFF'}
            </Button>
          </HStack>
        </VStack>
      </Box>

      {timeRangeError && (
        <Box
          p={3}
          bg="rgba(255, 51, 102, 0.1)"
          border="1px solid"
          borderColor="red.500"
          borderRadius="4px"
          color="red.500"
          fontSize="sm"
          fontFamily="mono"
        >
          {timeRangeError}
        </Box>
      )}

      <HStack justify="flex-end" gap={4}>
        <Button onClick={handleSave} loading={isUpdating} disabled={isUpdating} variant="primary">
          Save
        </Button>
      </HStack>
    </VStack>
  );
}
