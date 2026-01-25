import type { Settings } from '@/types/settings-client';

export interface AuthUser {
  id: string;
  email: string;
  settings?: Settings;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: unknown | null;
  error: string | null;
}

export interface Session {
  id: string;
  device_info: string;
  last_active: string;
  is_current: boolean;
}
