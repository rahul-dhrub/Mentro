/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true, // This allows serving local SVG files
  },
  env: {
    BUNNY_STORAGE_ZONE: process.env.BUNNY_STORAGE_ZONE,
    BUNNY_STORAGE_API_KEY: process.env.BUNNY_STORAGE_API_KEY,
    BUNNY_BASE_URL: process.env.BUNNY_BASE_URL,
    BUNNY_STREAM_LIBRARY: process.env.BUNNY_STREAM_LIBRARY,
    BUNNY_STREAM_API_KEY: process.env.BUNNY_STREAM_API_KEY,
  },
}

module.exports = nextConfig 