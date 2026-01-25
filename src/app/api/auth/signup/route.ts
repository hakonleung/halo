import { NextResponse } from 'next/server';
import { authService } from '@/lib/auth-service';
import { decryptPassword } from '@/utils/crypto';
import { getSupabaseClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    const { email, encryptedPassword, fullName } = await request.json();
    // Decrypt password
    const password = decryptPassword(encryptedPassword);
    const res = await authService.signUp(supabase, email, password, fullName);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ user: null, session: null, error: message }, { status: 500 });
  }
}
