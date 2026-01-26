import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';
import { goalService, type GetGoalsParams } from '@/lib/goal-service';
import { convertServerGoalToClient } from '@/types/__tests__/goal.test';

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Not authenticated' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params: GetGoalsParams = {};
    if (searchParams.get('status')) {
      params.status = searchParams.get('status') as 'active' | 'completed' | 'abandoned';
    }
    if (searchParams.get('category')) {
      params.category = searchParams.get('category') || undefined;
    }
    if (searchParams.get('sort')) {
      params.sort = searchParams.get('sort') as 'created_at' | 'name';
    }
    if (searchParams.get('order')) {
      params.order = searchParams.get('order') as 'asc' | 'desc';
    }

    const res = await goalService.getGoals(supabase, user.id, params);

    if (res.error) {
      return NextResponse.json({ data: null, error: res.error }, { status: 500 });
    }

    // Convert Server types to Client types
    const clientGoals = res.data?.map(convertServerGoalToClient) || [];

    return NextResponse.json({ data: clientGoals, error: null });
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

    const body = await request.json();

    // Validate required fields
    if (
      !body.name ||
      !body.category ||
      !body.startDate ||
      !body.criteria ||
      body.criteria.length === 0
    ) {
      return NextResponse.json(
        {
          data: null,
          error: 'Validation failed: name, category, startDate, and criteria are required',
        },
        { status: 400 },
      );
    }

    // Validate name length
    if (body.name.length > 100) {
      return NextResponse.json(
        { data: null, error: 'Validation failed: name must be 100 characters or less' },
        { status: 400 },
      );
    }

    // Validate end date
    if (body.endDate && new Date(body.endDate) < new Date(body.startDate)) {
      return NextResponse.json(
        { data: null, error: 'Validation failed: endDate must be after startDate' },
        { status: 400 },
      );
    }

    // Convert Client types to Server types
    const serverGoal = {
      name: body.name,
      description: body.description || null,
      category: body.category,
      start_date: body.startDate,
      end_date: body.endDate || null,
      criteria: body.criteria.map((c: { behaviorId: string; [key: string]: unknown }) => ({
        behavior_id: c.behaviorId,
        metric: c.metric,
        operator: c.operator,
        value: c.value,
        period: c.period,
        description: c.description,
      })),
    };

    const res = await goalService.createGoal(supabase, user.id, serverGoal);

    if (res.error) {
      return NextResponse.json({ data: null, error: res.error }, { status: 500 });
    }

    if (!res.data) {
      return NextResponse.json({ data: null, error: 'Failed to create goal' }, { status: 500 });
    }

    // Convert Server type to Client type
    const clientGoal = convertServerGoalToClient(res.data);

    return NextResponse.json({ data: clientGoal, error: null }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
