import { describe, expect, it } from 'vitest';
import {
  allowsUnauthenticatedAccess,
  getSafeLoginRedirectPath,
} from './auth-routing';

describe('allowsUnauthenticatedAccess', () => {
  it.each([
    '/auth/login',
    '/archive/case-id',
    '/fall/210',
    '/tutorial',
    '/tutorial/step-1',
    '/streak_challenge_2026_teilnahmebedingungen',
  ])('allows the public path %s', (pathname) => {
    expect(allowsUnauthenticatedAccess(pathname)).toBe(true);
  });

  it.each(['/submit', '/user', '/fallacious', '/archive-preview'])(
    'keeps the path %s protected',
    (pathname) => {
      expect(allowsUnauthenticatedAccess(pathname)).toBe(false);
    },
  );
});

describe('getSafeLoginRedirectPath', () => {
  it.each(['/submit', '/fall/210', '/user?tab=settings'])(
    'keeps the internal path %s',
    (path) => {
      expect(getSafeLoginRedirectPath(path)).toBe(path);
    },
  );

  it.each([
    null,
    'https://example.org',
    '//example.org',
    '/auth/login',
    '/auth/login?redirect=%2Fauth%2Flogin',
  ])('falls back to the root path for %s', (path) => {
    expect(getSafeLoginRedirectPath(path)).toBe('/');
  });
});
