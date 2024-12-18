/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'ajv$': 'ajv/dist/2020',
    };
    return config;
  },
};

export default nextConfig; 