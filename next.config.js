/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for pages that use client-side data
  output: 'standalone',
  
  // Configure redirects if needed
  async redirects() {
    return [];
  },
  
  // Configure headers if needed
  async headers() {
    return [];
  },
  
  // Disable image optimization if not needed
  images: {
    unoptimized: true,
    domains: ['image.tmdb.org', 'i.scdn.co'], // Allow images from TMDB and Spotify
  },
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure environment variables that should be exposed to the browser
  env: {
    // Add any environment variables that should be available to the browser here
  },
  
  // Experimental features
  experimental: {
    // Enable app directory features
    appDir: true,
  },
};

module.exports = nextConfig; 