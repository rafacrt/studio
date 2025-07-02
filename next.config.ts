
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Added for optimized Docker builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Added for placeholder images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cjimphtzmokxarflwfaf.supabase.co', // Added for Supabase Storage
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
