import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Vercel uses its own build adapter; standalone output is for the Docker runtime.
  output: process.env.VERCEL === '1' ? undefined : 'standalone',
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
