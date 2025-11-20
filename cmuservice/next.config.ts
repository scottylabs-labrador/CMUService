/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the 'experimental' block for Next.js 14
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
    ],
  },
};

module.exports = nextConfig;