import sanitizeHtml, { type IOptions } from 'sanitize-html';

const SANITIZE_RICH_TEXT_OPTIONS: IOptions = {
  allowedTags: ['a', 'br', 'strong', 'b', 'em', 'i', 'p', 'ul', 'ol', 'li'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
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
  },
};

export const sanitizeRichText = (value: string) =>
  sanitizeHtml(value, SANITIZE_RICH_TEXT_OPTIONS);
