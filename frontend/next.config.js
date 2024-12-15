/** @type {import('next').NextConfig} */
const nextConfig = {
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
