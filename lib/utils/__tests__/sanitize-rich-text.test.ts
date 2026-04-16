import { describe, expect, it } from 'vitest';
import { sanitizeRichText } from '../sanitize-rich-text';

describe('sanitizeRichText', () => {
  it('keeps safe links and forces noopener for new tabs', () => {
    expect(
      sanitizeRichText(
        'Mehr Infos <a href="https://example.com/path?x=1&amp;y=2" target="_blank" onclick="alert(1)">hier</a>.',
      ),
    ).toBe(
      'Mehr Infos <a href="https://example.com/path?x=1&amp;y=2" target="_blank" rel="noopener noreferrer">hier</a>.',
    );
  });

  it('removes unsafe hrefs from links', () => {
    expect(
      sanitizeRichText(
        'Mehr Infos <a href="java&#x73;cript:alert(1)">hier</a>.',
      ),
    ).toBe('Mehr Infos <a>hier</a>.');
  });

  it('removes unsupported tags and attributes', () => {
    expect(
      sanitizeRichText(
        'Text <img src=x onerror=alert(1)><strong onclick="alert(1)">wichtig</strong>',
      ),
    ).toBe('Text <strong>wichtig</strong>');
  });
});
