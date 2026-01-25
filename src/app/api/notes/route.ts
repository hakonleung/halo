import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { noteService } from '@/lib/note-service';

export async function GET() {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Not authenticated' }, { status: 401 });
    }

    const res = await noteService.getNotes(supabase, user.id);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Not authenticated' }, { status: 401 });
    }

    const note = await request.json();
    const res = await noteService.createNote(supabase, user.id, note);
    return NextResponse.json(res);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

