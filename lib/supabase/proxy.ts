import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  allowsUnauthenticatedAccess,
  getSafeLoginRedirectPath,
} from '../auth-routing';
import { shouldRedirectToTutorial, TUTORIAL_PATH } from '../tutorial-gate';
import { Database } from '../types/database.types';

function redirectPreservingCookies(
  url: URL,
  supabaseResponse: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(url);

  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirectResponse.cookies.set(name, value, options);
  });

  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data, error: claimsError } = await supabase.auth.getClaims();
  const user = data?.claims;
  const pathname = request.nextUrl.pathname;

  if (claimsError) {
    console.warn('Auth claims validation failed', {
      code: claimsError.code,
      pathname,
      status: claimsError.status,
    });
  }

  if (
    pathname !== '/' &&
    !user &&
    !allowsUnauthenticatedAccess(pathname)
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    const redirectPath = `${pathname}${request.nextUrl.search}`;
    url.pathname = '/auth/login';
    url.search = '';
    url.searchParams.set('redirect', redirectPath);
    return redirectPreservingCookies(url, supabaseResponse);
  }

  if (pathname === '/streak_challenge_2026_teilnahmebedingungen') {
    return supabaseResponse;
  }

  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('tutorial_completed_at')
      .eq('id', user.sub)
      .maybeSingle();

    if (error) {
      console.error('Error fetching tutorial completion state:', error);
    }

    if (
      !error &&
      shouldRedirectToTutorial({
        pathname,
        tutorialCompletedAt: profile?.tutorial_completed_at,
        userId: user.sub,
      })
    ) {
      const url = request.nextUrl.clone();
      url.pathname = TUTORIAL_PATH;
      return redirectPreservingCookies(url, supabaseResponse);
    }

    if (pathname === '/auth/login') {
      const url = new URL(
        getSafeLoginRedirectPath(request.nextUrl.searchParams.get('redirect')),
        request.url,
      );
      return redirectPreservingCookies(url, supabaseResponse);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
