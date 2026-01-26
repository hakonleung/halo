import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import type { AuthResponse } from '@/types/auth';
import type { Settings } from '@/types/settings-client';

/**
 * Authentication service - Server-side logic encapsulation
 * Although Supabase can be called from client, we encapsulate it in service layer per quality requirements
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  async signInWithEmail(
    supabase: SupabaseClient<Database>,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, session: null, error: 'User not found' };
    }

    // Get associated user settings
    const { data: settings } = await supabase
      .from('neolog_user_settings')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
        settings: settings ? (settings as Settings) : undefined,
      },
      session: data.session,
      error: null,
    };
  },

  /**
   * Sign up
   */
  async signUp(
    supabase: SupabaseClient<Database>,
    email: string,
    password: string,
    fullName?: string,
  ): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    return {
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email ?? '',
          }
        : null,
      session: data.session,
      error: null,
    };
  },

  /**
   * Sign out
   */
  async signOut(supabase: SupabaseClient<Database>): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  },

  /**
   * Get current user and UserSettings
   */
  async getCurrentUser(supabase: SupabaseClient<Database>): Promise<AuthResponse> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, session: null, error: authError?.message ?? 'Not authenticated' };
    }

    const { data: settings, error: settingsError } = await supabase
      .from('neolog_user_settings')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        settings: settingsError ? undefined : (settings as Settings),
      },
      session: null, // getUser doesn't return session, use getSession if needed
      error: null,
    };
  },

  /**
   * Sign in with GitHub (OAuth)
   * Note: OAuth is usually called directly from client for redirect
   */
  async signInWithGitHub(supabase: SupabaseClient<Database>): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  },
};
