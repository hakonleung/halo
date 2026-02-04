import { createApiHandler } from '@/server/services/api-helpers';
import { dashboardService } from '@/server/services/dashboard-service';

export const GET = createApiHandler(async (request, _params, supabase, user) => {
  const { searchParams } = new URL(request.url);
  const monthsParam = searchParams.get('months');
  const months = monthsParam ? parseInt(monthsParam, 10) : 12;
  const data = await dashboardService.getHeatmap(supabase, user.id, { months });
  return { data };
});
