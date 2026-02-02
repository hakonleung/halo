import { createApiHandler } from '@/lib/api-helpers';
import { goalService } from '@/lib/goal-service';
import { goalProgressService } from '@/lib/goal-progress-service';
import type { GoalProgress as ClientGoalProgress } from '@/types/goal-client';

export const GET = createApiHandler(
  async (_request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    const goal = await goalService.getGoal(supabase, user.id, id);

    // Calculate progress
    const progress = await goalProgressService.calculateProgress(supabase, user.id, goal);

    const clientProgress: ClientGoalProgress = {
      current: progress.current,
      target: progress.target,
      progress: progress.progress,
      isCompleted: progress.isCompleted,
      remainingDays: progress.remainingDays,
    };

    return {
      data: {
        ...goal,
        progress: clientProgress,
      },
    };
  },
);

export const PATCH = createApiHandler(
  async (request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const body = await request.json();

    // Validate name length if provided
    if (body.name && body.name.length > 100) {
      throw new Error('Validation failed: name must be 100 characters or less');
    }

    // Validate end date if provided
    if (body.endDate && body.startDate && new Date(body.endDate) < new Date(body.startDate)) {
      throw new Error('Validation failed: endDate must be after startDate');
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

    const { id } = await params;
    const data = await goalService.updateGoal(supabase, user.id, id, updates);
    return { data };
  },
);

export const DELETE = createApiHandler(
  async (_request, params = Promise.resolve({ id: '' }), supabase, user) => {
    const { id } = await params;
    await goalService.deleteGoal(supabase, user.id, id);
    return { data: null };
  },
);
