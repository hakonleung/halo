import { createApiHandler } from '@/lib/api-helpers';
import { dashboardService } from '@/lib/dashboard-service';
import { DashboardRange } from '@/types/dashboard-server';

export const GET = createApiHandler(async (request, _params, supabase, user) => {
  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get('range') || DashboardRange.Last7Days;
  // Validate and convert range parameter
  const range =
    Object.values(DashboardRange).find((r) => r === rangeParam) || DashboardRange.Last7Days;
  const start = searchParams.get('start') || undefined;
  const end = searchParams.get('end') || undefined;
  const typesParam = searchParams.get('types');
  const types = typesParam ? typesParam.split(',').filter(Boolean) : undefined;

  // Validate custom range
  if (range === DashboardRange.Custom) {
    if (!start || !end) {
      throw new Error('Start and end dates are required');
    }
    if (new Date(start) > new Date(end)) {
      throw new Error('Start date must be before end date');
    }
  }

  const data = await dashboardService.getTrends(supabase, user.id, {
    range,
    start,
    end,
    types,
  });
  return { data };
});
