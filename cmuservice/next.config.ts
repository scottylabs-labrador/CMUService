// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Paste your Supabase project's hostname here
        hostname: 'kmsiawreljpswyazkjbh.supabase.co', 
        // Example: hostname: 'kmsiawrelpowyackjqh.supabase.co',
      },
    ],
  },
};

module.exports = nextConfig;