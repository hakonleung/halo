import { createApiHandler } from '@neo-log/be-edge';
import { dashboardService } from '@/server/services/dashboard-service';

export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await dashboardService.getStats(supabase, user.id);
  return { data };
});
