/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // allow images from any source
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
