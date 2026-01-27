/**
 * Auth API
 */

import { BaseApiService } from './base';
import type { AuthResponse } from '@/types/auth';

export const authApi = {
  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    return BaseApiService.fetchApi<AuthResponse>('/api/auth/me');
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
