/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tcommvmrmgtdqnxoagve.supabase.co",
        pathname: "/storage/v1/object/public/**",
      }
    ]
  },
};

module.exports = nextConfig; 