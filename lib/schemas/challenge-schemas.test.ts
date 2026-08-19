import { describe, expect, it } from 'vitest';
import {
  challengeConfigContentSchema,
  challengeMilestoneSchema,
} from './challenge-schemas';

describe('challengeMilestoneSchema', () => {
  it('normalizes legacy numeric milestones', () => {
    expect(challengeMilestoneSchema.parse(50)).toEqual({
      value: 50,
      label: undefined,
      tooltip: undefined,
    });
  });

  it('keeps optional milestone information', () => {
    expect(
      challengeMilestoneSchema.parse({
        value: 75,
        label: 'Mehr Gewinne',
        tooltip:
          'Bei 75 gibt es erste Gewinne. Erfahre <a href="/#challenge-information">hier</a> mehr.',
      }),
    ).toEqual({
      value: 75,
      label: 'Mehr Gewinne',
      tooltip:
        'Bei 75 gibt es erste Gewinne. Erfahre <a href="/#challenge-information">hier</a> mehr.',
    });
  });
});

describe('challengeConfigContentSchema', () => {
  it('validates a review cap and its usernames separately', () => {
    const { leaderboardReviewCap, leaderboardReviewCapUsernames } =
      challengeConfigContentSchema.shape;

    expect(leaderboardReviewCap.safeParse(5).success).toBe(true);
    expect(
      leaderboardReviewCapUsernames.safeParse(['gormlabenz']).success,
    ).toBe(true);
    expect(
      leaderboardReviewCapUsernames.safeParse({ gormlabenz: 5 }).success,
    ).toBe(false);
  });
});
