import { dashboardService } from '@/server/services/dashboard-service';

import { createApiHandler } from '@neo-log/be-edge';

export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await dashboardService.getStats(supabase, user.id);
  return { data };
});
