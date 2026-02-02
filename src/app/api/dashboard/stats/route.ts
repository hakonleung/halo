import { createApiHandler } from '@/lib/api-helpers';
import { dashboardService } from '@/lib/dashboard-service';

export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await dashboardService.getStats(supabase, user.id);
  return { data };
});
