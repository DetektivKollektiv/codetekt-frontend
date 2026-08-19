import sanitizeHtml, { type IOptions } from 'sanitize-html';

const SANITIZE_RICH_TEXT_OPTIONS: IOptions = {
  allowedTags: [
    'a',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'p',
    'ul',
    'ol',
    'li',
    'section',
    'h4',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    a: (_tagName, attributes) => {
      const sanitizedAttributes: Record<string, string> = {};

      if (attributes.href) {
        sanitizedAttributes.href = attributes.href;
      }

      if (attributes.target === '_blank') {
        sanitizedAttributes.target = '_blank';
        sanitizedAttributes.rel = 'noopener noreferrer';
      }

      return {
        tagName: 'a',
        attribs: sanitizedAttributes,
      };
    },
    img: (_tagName, attributes) => {
      const sanitizedAttributes: Record<string, string> = {
        alt: attributes.alt ?? '',
        loading: 'lazy',
        decoding: 'async',
      };

      if (attributes.src) {
        sanitizedAttributes.src = attributes.src;
      }

      if (attributes.width && /^\d+$/.test(attributes.width)) {
        sanitizedAttributes.width = attributes.width;
      }

      if (attributes.height && /^\d+$/.test(attributes.height)) {
        sanitizedAttributes.height = attributes.height;
      }

      return {
        tagName: 'img',
        attribs: sanitizedAttributes,
      };
    },
  },
};

export const sanitizeRichText = (value: string) =>
  sanitizeHtml(value, SANITIZE_RICH_TEXT_OPTIONS);
