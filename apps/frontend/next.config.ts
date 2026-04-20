import type { NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// Standalone + tracing root are for production Docker images only. In `next dev`, setting
// outputFileTracingRoot to the repo root breaks fast refresh because watchers target the wrong tree
// (especially with Docker bind mounts to apps/frontend only).
const isProductionBuild =
  process.env.NODE_ENV === 'production' ||
  process.env.npm_lifecycle_event === 'build' ||
  process.argv.includes('build');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isProductionBuild
    ? {
        output: 'standalone' as const,
        outputFileTracingRoot: monorepoRoot,
      }
    : {}),
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ecommerce-avatars-sabaoth8.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
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
        destination: `${process.env.BACKEND_URL || 'http://api:3000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
