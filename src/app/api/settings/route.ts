import { settingsService } from '@/server/services/settings-service';

import { createApiHandler } from '@neo-log/be-edge';

export const GET = createApiHandler(async (_request, _params, supabase, user) => {
  const data = await settingsService.getSettings(supabase, user.id);
  return { data };
});

export const PATCH = createApiHandler(async (request, _params, supabase, user) => {
  const updates = await request.json();
  const data = await settingsService.updateSettings(supabase, user.id, updates);
  return { data };
});
