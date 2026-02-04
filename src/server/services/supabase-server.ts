import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/server/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NextResponse, NextRequest } from 'next/server';

/**
 * Get Supabase client for API routes (server-side)
 * Uses cookies() from next/headers for cookie handling
 * Note: This version only supports reading cookies, not setting them
 */
export async function getSupabaseClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not set');
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
  return supabase;
}

/**
 * Get Supabase client for API routes with cookie set/remove support
 * Uses cookies() from next/headers and NextResponse for cookie handling
 * Note: response is passed by reference and will be updated with cookies
 */
export async function getSupabaseClientForApiRoute(
  response: NextResponse,
): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not set');
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(
        name: string,
        value: string,
        options: { path?: string; httpOnly?: boolean; maxAge?: number },
      ) {
        // Set cookie in response (cookies() is read-only in API routes)
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: { path?: string }) {
        // Remove cookie from response
        response.cookies.set({
          name,
          value: '',
          ...options,
          maxAge: 0,
        });
      },
    },
  });
  return supabase;
}

/**
 * Get Supabase client for middleware (server-side)
 * Uses NextRequest for cookie handling with set/remove support
 * Note: response is passed by reference and will be updated
 */
export function getSupabaseClientForMiddleware(
  request: NextRequest,
  getResponse: () => NextResponse,
): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not set');
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(
        name: string,
        value: string,
        options: { path?: string; httpOnly?: boolean; maxAge?: number },
      ) {
        request.cookies.set({
          name,
          value,
          ...options,
        });
        const response = getResponse();
        response.cookies.set({
          name,
          value,
          ...options,
        });
      },
      remove(name: string, options: { path?: string }) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        });
        const response = getResponse();
        response.cookies.set({
          name,
          value: '',
          ...options,
        });
      },
    },
  });
  return supabase;
}
