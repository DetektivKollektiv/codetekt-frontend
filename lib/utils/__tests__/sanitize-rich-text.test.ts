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

  it('keeps mailto links', () => {
    expect(
      sanitizeRichText(
        'Schreib uns eine <a href="mailto:info@codetekt.org">Mail</a>.',
      ),
    ).toBe('Schreib uns eine <a href="mailto:info@codetekt.org">Mail</a>.');
  });

  it('keeps internal links', () => {
    expect(
      sanitizeRichText(
        'Mehr Infos gibt’s <a href="#challenge-information">hier</a>.',
      ),
    ).toBe(
      'Mehr Infos gibt’s <a href="#challenge-information">hier</a>.',
    );
  });

  it('removes unsupported tags and attributes', () => {
    expect(
      sanitizeRichText(
        'Text <iframe src="https://example.com"></iframe><strong onclick="alert(1)">wichtig</strong>',
      ),
    ).toBe('Text <strong>wichtig</strong>');
  });

  it('keeps safe images and adds safe loading attributes', () => {
    expect(
      sanitizeRichText(
        '<img src="/images/prize.png" alt="Challenge-Gewinne" width="2000" height="857" onerror="alert(1)">',
      ),
    ).toBe(
      '<img alt="Challenge-Gewinne" loading="lazy" decoding="async" src="/images/prize.png" width="2000" height="857" />',
    );
  });

  it('keeps semantic sections and headings without unsafe attributes', () => {
    expect(
      sanitizeRichText(
        '<section onclick="alert(1)"><h4 class="hidden">Gewinne</h4><p>Details</p></section>',
      ),
    ).toBe('<section><h4>Gewinne</h4><p>Details</p></section>');
  });

  it('removes unsafe image sources and invalid dimensions', () => {
    expect(
      sanitizeRichText(
        '<img src="javascript:alert(1)" alt="Test" width="100%" height="auto">',
      ),
    ).toBe('<img alt="Test" loading="lazy" decoding="async" />');
  });
});
