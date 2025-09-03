import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  eslint: {
    // Allow production builds with ESLint errors (temporary)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds with TypeScript errors (temporary)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '*.eden.art',
      }
    ],
    unoptimized: true,
  },
  // Environment variable exposure
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    WS_SOURCE: process.env.WS_SOURCE,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  }
};

export default nextConfig;