import { NextResponse } from 'next/server';

import { getSupabaseClientForMiddleware } from '@neo-log/be-edge';

import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = getSupabaseClientForMiddleware(request, () => {
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    return response;
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedRoutes = ['/dashboard', '/log', '/chat', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === '/' && session) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const targetPath = redirectParam || '/log';
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
