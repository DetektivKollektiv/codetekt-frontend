import { describe, expect, it } from 'vitest';
import {
  formatChallengeMessageDateRange,
  getVisibleChallengeMessage,
} from './challenge-message';
import type { ChallengeMessageData } from './schemas';

const message = (
  overrides: Partial<ChallengeMessageData> = {},
): ChallengeMessageData => ({
  contentHtml: '<p>Erste Nachricht</p>',
  visibleFrom: '2026-07-14T00:00:00+00:00',
  visibleUntil: '2026-07-20T23:59:59.999+00:00',
  ...overrides,
});

describe('getVisibleChallengeMessage', () => {
  it('returns null when no message is visible', () => {
    expect(
      getVisibleChallengeMessage(
        [message()],
        new Date('2026-07-21T00:00:00+00:00'),
      ),
    ).toBeNull();
  });

  it('treats the visibility boundaries as visible', () => {
    const visibleMessage = message();

    expect(
      getVisibleChallengeMessage(
        [visibleMessage],
        new Date('2026-07-14T00:00:00+00:00'),
      ),
    ).toBe(visibleMessage);
    expect(
      getVisibleChallengeMessage(
        [visibleMessage],
        new Date('2026-07-20T23:59:59.999+00:00'),
      ),
    ).toBe(visibleMessage);
  });

  it('returns the newest visible message', () => {
    const olderMessage = message({
      contentHtml: '<p>Alt</p>',
      visibleFrom: '2026-07-14T00:00:00+00:00',
      visibleUntil: '2026-07-25T23:59:59.999+00:00',
    });
    const newerMessage = message({
      contentHtml: '<p>Neu</p>',
      visibleFrom: '2026-07-18T00:00:00+00:00',
      visibleUntil: '2026-07-22T23:59:59.999+00:00',
    });

    expect(
      getVisibleChallengeMessage(
        [olderMessage, newerMessage],
        new Date('2026-07-19T12:00:00+00:00'),
      ),
    ).toBe(newerMessage);
  });

  it('ignores messages with invalid dates', () => {
    const visibleMessage = message();

    expect(
      getVisibleChallengeMessage(
        [
          message({
            contentHtml: '<p>Kaputt</p>',
            visibleFrom: 'kein Datum',
          }),
          visibleMessage,
        ],
        new Date('2026-07-15T12:00:00+00:00'),
      ),
    ).toBe(visibleMessage);
  });
});

describe('formatChallengeMessageDateRange', () => {
  it('formats the visible date range for display', () => {
    expect(formatChallengeMessageDateRange(message())).toBe(
      '14.07.2026 - 20.07.2026',
    );
  });
});
