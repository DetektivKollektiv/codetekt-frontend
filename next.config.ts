import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'codetekt.org',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
