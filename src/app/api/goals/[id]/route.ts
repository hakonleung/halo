import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { goalService } from '@/lib/goal-service';
import { goalProgressService } from '@/lib/goal-progress-service';
import { convertServerGoalToClient } from '@/types/__tests__/goal.test';
import type { GoalProgress as ClientGoalProgress } from '@/types/goal-client';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Not authenticated' }, { status: 401 });
    }

    const res = await goalService.getGoal(supabase, user.id, params.id);

    if (res.error) {
      if (res.error === 'Goal not found') {
        return NextResponse.json({ data: null, error: res.error }, { status: 404 });
      }
      return NextResponse.json({ data: null, error: res.error }, { status: 500 });
    }

    if (!res.data) {
      return NextResponse.json({ data: null, error: 'Goal not found' }, { status: 404 });
    }

    // Calculate progress
    const progress = await goalProgressService.calculateProgress(supabase, user.id, res.data);

    // Convert Server types to Client types
    const clientGoal = convertServerGoalToClient(res.data);
    const clientProgress: ClientGoalProgress = {
      current: progress.current,
      target: progress.target,
      progress: progress.progress,
      isCompleted: progress.isCompleted,
      remainingDays: progress.remainingDays,
    };

    return NextResponse.json({
      data: {
        ...clientGoal,
        progress: clientProgress,
      },
      error: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();

    // Validate name length if provided
    if (body.name && body.name.length > 100) {
      return NextResponse.json(
        { data: null, error: 'Validation failed: name must be 100 characters or less' },
        { status: 400 },
      );
    }

    // Validate end date if provided
    if (body.endDate && body.startDate && new Date(body.endDate) < new Date(body.startDate)) {
      return NextResponse.json(
        { data: null, error: 'Validation failed: endDate must be after startDate' },
        { status: 400 },
      );
    }

    // Convert Client types to Server types
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description || null;
    if (body.category !== undefined) updates.category = body.category;
    if (body.startDate !== undefined) updates.start_date = body.startDate;
    if (body.endDate !== undefined) updates.end_date = body.endDate || null;
    if (body.status !== undefined) updates.status = body.status;
    if (body.criteria !== undefined) {
      updates.criteria = body.criteria.map((c: { behaviorId: string; [key: string]: unknown }) => ({
        behavior_id: c.behaviorId,
        metric: c.metric,
        operator: c.operator,
        value: c.value,
        period: c.period,
        description: c.description,
      }));
    }

    const res = await goalService.updateGoal(supabase, user.id, params.id, updates);

    if (res.error) {
      if (res.error === 'Goal not found') {
        return NextResponse.json({ data: null, error: res.error }, { status: 404 });
      }
      return NextResponse.json({ data: null, error: res.error }, { status: 500 });
    }

    if (!res.data) {
      return NextResponse.json({ data: null, error: 'Goal not found' }, { status: 404 });
    }

    // Convert Server type to Client type
    const clientGoal = convertServerGoalToClient(res.data);

    return NextResponse.json({ data: clientGoal, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const res = await goalService.deleteGoal(supabase, user.id, params.id);

    if (res.error) {
      if (res.error === 'Goal not found') {
        return NextResponse.json({ error: res.error }, { status: 404 });
      }
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    return NextResponse.json({ error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
