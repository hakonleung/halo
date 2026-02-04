import { createApiHandler } from '@/server/services/api-helpers';
import { dashboardService } from '@/server/services/dashboard-service';

export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await dashboardService.getStats(supabase, user.id);
  return { data };
});
