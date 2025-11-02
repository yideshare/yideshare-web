/** @type {import('next').NextConfig} */
const nextConfig = {

  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || '',
  },
  reactStrictMode: true,
  images: {
    domains: ['secure.its.yale.edu'],
  },
};

export default nextConfig;