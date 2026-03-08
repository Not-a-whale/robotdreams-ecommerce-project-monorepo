import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${
          process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3000'
        }/:path*`,
      },
    ];
  },
};

export default nextConfig;
