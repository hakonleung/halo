import { createApiHandler } from '@/server/services/api-helpers';
import { goalService, type GetGoalsParams } from '@/server/services/goal-service';

export const GET = createApiHandler(async (request, _params, supabase, user) => {
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const params: GetGoalsParams = {};
  const statusParam = searchParams.get('status');
  if (
    statusParam &&
    (statusParam === 'active' || statusParam === 'completed' || statusParam === 'abandoned')
  ) {
    params.status = statusParam;
  }
  if (searchParams.get('category')) {
    params.category = searchParams.get('category') || undefined;
  }
  const sortParam = searchParams.get('sort');
  if (sortParam && (sortParam === 'created_at' || sortParam === 'name')) {
    params.sort = sortParam;
  }
  const orderParam = searchParams.get('order');
  if (orderParam && (orderParam === 'asc' || orderParam === 'desc')) {
    params.order = orderParam;
  }

  const data = await goalService.getGoals(supabase, user.id, params);
  return { data };
});

export const POST = createApiHandler(async (request, _params, supabase, user) => {
  const body = await request.json();

  // Validate required fields
  if (
    !body.name ||
    !body.category ||
    !body.startDate ||
    !body.criteria ||
    body.criteria.length === 0
  ) {
    throw new Error('Validation failed: name, category, startDate, and criteria are required');
  }

  // Validate name length
  if (body.name.length > 100) {
    throw new Error('Validation failed: name must be 100 characters or less');
  }

  // Validate end date
  if (body.endDate && new Date(body.endDate) < new Date(body.startDate)) {
    throw new Error('Validation failed: endDate must be after startDate');
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

  const data = await goalService.createGoal(supabase, user.id, serverGoal);
  return { data, status: 201 };
});
