import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseClientForMiddleware } from '@/server/services/supabase-server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create Supabase client for server-side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Create a response object to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = getSupabaseClientForMiddleware(request, () => {
    // Recreate response if it was modified
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    return response;
  });

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/log', '/chat', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If accessing protected route without session, redirect to home with redirect param
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If accessing home page with session, redirect based on redirect param or default to log
  if (pathname === '/' && session) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const targetPath = redirectParam || '/log';
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
