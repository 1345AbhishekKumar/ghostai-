/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Clerk user avatar CDN
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        // Clerk legacy avatar CDN
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },
};

module.exports = nextConfig;