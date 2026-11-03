/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  transpilePackages: ['@xenon-kit/web'],
  experimental: {
    optimizePackageImports: [
      '@phosphor-icons/react',
      'lucide-react',
      '@xenon-kit/web',
    ],
  },
};

export default nextConfig;
