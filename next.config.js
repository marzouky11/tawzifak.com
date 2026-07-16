
require('dotenv').config({ path: './.env.local' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  experimental: {
    optimizeCss: true,
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/**',
      },
      {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**',
      },
      {
          protocol: 'https',
          hostname: 'www.tawzifak.com',
          port: '',
          pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|css|js|woff2|woff|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/jobs',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/api/jobs',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=600, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/api/ads',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, max-age=600, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/:path*.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, stale-while-revalidate=600',
          },
        ],
      },
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  compress: true,
};

module.exports = nextConfig;
        
