/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed for local development
  images: {
    unoptimized: true, 
  },
  trailingSlash: true,
};

module.exports = nextConfig;