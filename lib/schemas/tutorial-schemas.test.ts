import { describe, expect, it } from 'vitest';
import { tutorialContentSchema } from './tutorial-schemas';

describe('tutorialContentSchema', () => {
  it('accepts tutorial content with FAQ, articles, and a community card', () => {
    expect(
      tutorialContentSchema.safeParse({
        faqItems: [
          {
            id: 'faq-1',
            title: 'Wie funktioniert codetekt?',
            answerHtml:
              'Mehr dazu <a href="https://codetekt.org" target="_blank" rel="noopener noreferrer">hier</a>.',
          },
        ],
        blogArticles: [
          {
            id: 'article-1',
            url: 'https://codetekt.org/informationen/',
            title: 'Trust-Checking',
            description: 'Ein kompakter Einstieg in das Thema.',
            imageUrl: '/images/lady-detective.svg',
            publishedAt: '2026-04-29',
            siteName: 'codetekt',
          },
        ],
        communityCard: {
          title: 'Tritt der Community bei',
          description: 'Tausche dich mit anderen aus.',
          buttonLabel: 'Zum Discord',
          url: 'https://example.com/discord',
          illustrationSrc: '/images/community-people.svg',
        },
      }).success,
    ).toBe(true);
  });

  it('rejects tutorial content with invalid article URLs', () => {
    expect(
      tutorialContentSchema.safeParse({
        faqItems: [],
        blogArticles: [
          {
            id: 'article-1',
            url: 'not-a-url',
            title: 'Trust-Checking',
            description: 'Ein kompakter Einstieg in das Thema.',
            imageUrl: '/images/lady-detective.svg',
            publishedAt: '2026-04-29',
            siteName: 'codetekt',
          },
        ],
        communityCard: {
          title: 'Tritt der Community bei',
          description: 'Tausche dich mit anderen aus.',
          buttonLabel: 'Zum Discord',
          url: 'https://example.com/discord',
          illustrationSrc: '/images/community-people.svg',
        },
      }).success,
    ).toBe(false);
  });
});
