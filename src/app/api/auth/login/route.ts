import { NextResponse } from 'next/server';

import { authService } from '@/server/services/auth-service';
import { getSupabaseClientForApiRoute } from '@/server/services/supabase-server';
import { decryptPassword } from '@/server/utils/crypto';

export async function POST(request: Request) {
  try {
    const response = NextResponse.json({});
    const supabase = await getSupabaseClientForApiRoute(response);
    const { email, encryptedPassword } = await request.json();
    // Decrypt password
    const password = decryptPassword(encryptedPassword);
    const res = await authService.signInWithEmail(supabase, email, password);

    // Update response with data and cookies (set by Supabase client)
    return NextResponse.json(res, {
      headers: response.headers,
      status: res.error ? 400 : 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ user: null, session: null, error: message }, { status: 500 });
  }
}
