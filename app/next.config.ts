import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    ppr: false,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kmsiawreljpswyazkjbh.supabase.co',
        port: '',
      },
      {
        protocol: 'https', 
        hostname: 'bucket-scottylabs.up.railway.app',
        port: '', // Explicitly empty port ensures standard HTTPS matching
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
    ],
  },
};

export default nextConfig;