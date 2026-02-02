import { createApiHandler } from '@/lib/api-helpers';
import { authService } from '@/lib/auth-service';

export const GET = createApiHandler(async (_request, _params, supabase) => {
  const res = await authService.getCurrentUser(supabase);
  return { data: { user: res.user, session: res.session } };
});
