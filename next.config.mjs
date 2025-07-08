/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    scrollRestoration: true,
  },
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
      },
      {
        protocol: "https",
        hostname: "tcommvmrmgtdqnxoagve.storage.supabase.co",
        pathname: "/v1/object/public/backgrounds/**",
      }
    ]
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'ajv$': 'ajv/dist/2020',
    };
    // In production, remove console.log statements but keep console.error and console.warn
    if (!dev && !isServer) {
      if (Array.isArray(config.optimization.minimizer)) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (
            minimizer?.options?.terserOptions?.compress
          ) {
            minimizer.options.terserOptions.compress.drop_console = true;
            minimizer.options.terserOptions.compress.pure_funcs = [
              'console.log',
              'console.info',
              'console.debug',
            ];
          }
        });
      }
    }
    return config;
  },
};

export default nextConfig; 