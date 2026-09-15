import { describe, expect, it } from 'vitest';
import { getSafeRedirectPath } from './safe-redirect-path';

describe('getSafeRedirectPath', () => {
  it.each([
    '/',
    '/auth/update-password',
    '/user?tab=settings#profile',
  ])('keeps the internal path %s', (path) => {
    expect(getSafeRedirectPath(path)).toBe(path);
  });

  it.each([
    null,
    '',
    'user',
    'https://example.org',
    '//example.org',
    '///example.org',
    '/\\example.org',
  ])('falls back to the root path for %s', (path) => {
    expect(getSafeRedirectPath(path)).toBe('/');
  });
});
