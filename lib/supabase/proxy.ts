import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
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
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const pathname = request.nextUrl.pathname;

  const unauthenticatedPaths = ['/login', '/auth', '/archive', TUTORIAL_PATH];

  if (
    pathname !== '/' &&
    !user &&
    !unauthenticatedPaths.some((path) =>
      pathname.startsWith(path),
    )
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return redirectPreservingCookies(url, supabaseResponse);
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
