import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 1. Check for local dev / pilot session cookie
  const devSessionCookie = request.cookies.get('aiesec_dev_session');
  let devUser: { email: string; role?: string; name?: string } | null = null;
  if (devSessionCookie?.value) {
    try {
      devUser = JSON.parse(decodeURIComponent(devSessionCookie.value));
    } catch {
      // Ignore parse failure
    }
  }

  // 2. Check Supabase session with try-catch so network errors don't crash middleware
  let supabaseUser = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    supabaseUser = user;
  } catch {
    // Supabase auth service not active locally
  }

  const effectiveEmail = supabaseUser?.email || devUser?.email;

  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api/auth');

  const isPublicRoute =
    request.nextUrl.pathname === '/' ||
    isAuthRoute ||
    request.nextUrl.pathname.startsWith('/unauthorized');

  if (effectiveEmail) {
    // REQ-001 & REQ-002: Enforce strict @aiesec.net domain restriction
    const email = effectiveEmail.toLowerCase();
    const isAiesecNet = email.endsWith('@aiesec.net');

    if (!isAiesecNet) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.searchParams.set('reason', 'domain_restricted');
      const res = NextResponse.redirect(url);
      res.cookies.delete('aiesec_dev_session');
      return res;
    }

    // Authenticated aiesec.net user trying to visit /login redirects to operational cockpit
    if (request.nextUrl.pathname === '/login') {
      const redirectTarget =
        request.nextUrl.searchParams.get('redirect') || '/operations/national-cockpit';
      const url = request.nextUrl.clone();
      url.pathname = redirectTarget;
      url.searchParams.delete('redirect');
      return NextResponse.redirect(url);
    }
  } else if (!isPublicRoute) {
    // Unauthenticated user attempting to access protected ERP areas
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
