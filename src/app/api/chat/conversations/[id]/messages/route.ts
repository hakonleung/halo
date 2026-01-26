import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { chatService } from '@/lib/chat-service';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Not authenticated' }, { status: 401 });
    }

    const res = await chatService.getMessages(supabase, user.id, id);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
