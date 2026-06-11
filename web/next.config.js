/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/LUXA',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin'],
  },
  swcMinify: true,
};

module.exports = nextConfig;
