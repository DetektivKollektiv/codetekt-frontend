import { describe, expect, it } from 'vitest';
import { shouldRedirectToTutorial } from './tutorial-gate';

describe('shouldRedirectToTutorial', () => {
  it('redirects authenticated users with an unread tutorial', () => {
    expect(
      shouldRedirectToTutorial({
        pathname: '/submit',
        tutorialCompletedAt: null,
        userId: 'user-1',
      }),
    ).toBe(true);
  });

  it('does not redirect users who completed the tutorial', () => {
    expect(
      shouldRedirectToTutorial({
        pathname: '/submit',
        tutorialCompletedAt: '2026-05-06T12:00:00.000Z',
        userId: 'user-1',
      }),
    ).toBe(false);
  });

  it('does not redirect guests or missing profiles', () => {
    expect(
      shouldRedirectToTutorial({
        pathname: '/submit',
        tutorialCompletedAt: null,
        userId: null,
      }),
    ).toBe(false);

    expect(
      shouldRedirectToTutorial({
        pathname: '/submit',
        tutorialCompletedAt: undefined,
        userId: 'user-1',
      }),
    ).toBe(false);
  });

  it('does not redirect from the tutorial route', () => {
    expect(
      shouldRedirectToTutorial({
        pathname: '/tutorial',
        tutorialCompletedAt: null,
        userId: 'user-1',
      }),
    ).toBe(false);
  });
});
