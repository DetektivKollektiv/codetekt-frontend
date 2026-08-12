import { describe, expect, it } from 'vitest';
import { challengeMilestoneSchema } from './challenge-schemas';

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
        label: 'Gewinne',
        tooltip:
          'Bei 75 gibt es erste Gewinne. Erfahre <a href="/#challenge-information">hier</a> mehr.',
      }),
    ).toEqual({
      value: 75,
      label: 'Gewinne',
      tooltip:
        'Bei 75 gibt es erste Gewinne. Erfahre <a href="/#challenge-information">hier</a> mehr.',
    });
  });
});
