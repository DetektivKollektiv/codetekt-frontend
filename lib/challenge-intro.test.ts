import { describe, expect, it } from 'vitest';
import { hasSeenChallengeIntroForVisibilityWindow } from './challenge-intro';

describe('hasSeenChallengeIntroForVisibilityWindow', () => {
  it('requires a stored seen timestamp', () => {
    expect(
      hasSeenChallengeIntroForVisibilityWindow({
        seenAt: null,
        visibleFrom: '2026-09-01T00:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('treats a seen timestamp inside the visibility window as seen', () => {
    expect(
      hasSeenChallengeIntroForVisibilityWindow({
        seenAt: '2026-09-03T12:00:00.000Z',
        visibleFrom: '2026-09-01T00:00:00.000Z',
      }),
    ).toBe(true);
  });

  it('does not carry an old challenge seen timestamp into a new window', () => {
    expect(
      hasSeenChallengeIntroForVisibilityWindow({
        seenAt: '2026-08-31T23:59:59.999Z',
        visibleFrom: '2026-09-01T00:00:00.000Z',
      }),
    ).toBe(false);
  });
});
