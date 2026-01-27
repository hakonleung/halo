/**
 * Settings API
 */

import { BaseApiService, type ApiResponse } from './base';
import type {
  UserSettings as ServerUserSettings,
  SettingsUpdateRequest as ServerSettingsUpdateRequest,
} from '@/types/settings-server';
import type {
  Settings as ClientSettings,
  SettingsUpdateRequest as ClientSettingsUpdateRequest,
} from '@/types/settings-client';

// Settings types are already compatible
function convertSettings(server: ServerUserSettings): ClientSettings {
  return server;
}

export const settingsApi = {
  /**
   * Get user settings
   */
  async getSettings(): Promise<ClientSettings | null> {
    const response =
      await BaseApiService.fetchApi<ApiResponse<ServerUserSettings>>('/api/settings');

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data ? convertSettings(response.data) : null;
  },

  /**
   * Update user settings
   */
  async updateSettings(updates: ClientSettingsUpdateRequest): Promise<ClientSettings> {
    const serverRequest: ServerSettingsUpdateRequest = updates;

    const response = await BaseApiService.fetchApi<ApiResponse<ServerUserSettings>>(
      '/api/settings',
      {
        method: 'PATCH',
        body: JSON.stringify(serverRequest),
      },
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to update settings');
    }

    return convertSettings(response.data);
  },
};
