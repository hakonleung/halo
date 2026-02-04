import type { UserSettings } from './settings-server';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    settings?: UserSettings;
  } | null;
  session: unknown | null;
  error: string | null;
}
