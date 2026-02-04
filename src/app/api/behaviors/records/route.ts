import { createApiHandler } from '@/server/services/api-helpers';
import { behaviorService } from '@/server/services/behavior-service';

export const GET = createApiHandler(async (request, _params, supabase, user) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const data = await behaviorService.getRecords(supabase, user.id, limit, offset);
  return { data };
});

export const POST = createApiHandler(async (request, _params, supabase, user) => {
  const record = await request.json();
  const data = await behaviorService.createRecord(supabase, user.id, record);
  return { data, status: 201 };
});
