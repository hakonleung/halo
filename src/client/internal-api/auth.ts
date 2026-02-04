/**
 * Auth API
 */

import { BaseApiService } from './base';

import type { ApiResponse } from './base';
import type { AuthResponse } from '@/server/types/auth';

export const authApi = {
  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await BaseApiService.fetchApi<ApiResponse<AuthResponse>>('/api/auth/me');

    if ('error' in response) {
      throw new Error(response.error);
    }
    return response;
  },

  /**
   * Login
   */
  async login(email: string, encryptedPassword: string): Promise<AuthResponse> {
    return BaseApiService.fetchApi<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, encryptedPassword }),
    });
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await BaseApiService.fetchApi<{ error: string | null }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Signup
   */
  async signup(email: string, encryptedPassword: string): Promise<AuthResponse> {
    return BaseApiService.fetchApi<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, encryptedPassword }),
    });
  },
};
