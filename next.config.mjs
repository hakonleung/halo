/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@neo-log/equity-fe', '@neo-log/equity-be', '@neo-log/be-edge', '@neo-log/be-core'],
};

export default nextConfig;
