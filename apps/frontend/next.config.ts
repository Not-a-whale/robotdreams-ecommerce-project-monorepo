import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
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
