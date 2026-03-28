import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/arena-analytics',
  assetPrefix: '/arena-analytics/',
  images: {
    unoptimized: true
  },
  transpilePackages: ['geist']
};

export default nextConfig;
