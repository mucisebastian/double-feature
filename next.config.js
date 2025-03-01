/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['image.tmdb.org', 'i.scdn.co'], // Allow images from TMDB and Spotify
  },
}

module.exports = nextConfig 