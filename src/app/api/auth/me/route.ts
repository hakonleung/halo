import { authService } from '@/server/services/auth-service';

import { createApiHandler } from '@neo-log/be-edge';

export const GET = createApiHandler(async (_request, _params, supabase) => {
  const res = await authService.getCurrentUser(supabase);
  return { data: { user: res.user, session: res.session } };
});
