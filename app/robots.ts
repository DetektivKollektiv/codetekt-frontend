import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    // Crawlers must be allowed to read the staging pages and their noindex tag.
    rules: {
      userAgent: '*',
      allow: '/',
    },
  };
}
