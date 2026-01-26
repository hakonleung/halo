import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get Supabase client for API routes (server-side)
 * Uses cookies() from next/headers for cookie handling
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
