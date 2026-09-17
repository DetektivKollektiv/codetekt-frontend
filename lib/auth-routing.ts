import { getSafeRedirectPath } from './safe-redirect-path';
import { TUTORIAL_PATH } from './tutorial-gate';

const unauthenticatedPathPrefixes = [
  '/login',
  '/auth',
  '/archive',
  '/fall',
  TUTORIAL_PATH,
];

const exactUnauthenticatedPaths = [
  '/streak_challenge_2026_teilnahmebedingungen',
];

function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function allowsUnauthenticatedAccess(pathname: string) {
  return (
    exactUnauthenticatedPaths.includes(pathname) ||
    unauthenticatedPathPrefixes.some((prefix) =>
      matchesPathPrefix(pathname, prefix),
    )
  );
}

export function getSafeLoginRedirectPath(value: string | null) {
  const redirectPath = getSafeRedirectPath(value);

  return matchesPathPrefix(redirectPath, '/auth') ? '/' : redirectPath;
}
