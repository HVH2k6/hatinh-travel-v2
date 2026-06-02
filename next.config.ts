import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {
 images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Cho phép tất cả các domain dùng https
      },
      {
        protocol: 'http',
        hostname: '**', // Cho phép tất cả các domain dùng http
      },
    ],
  },
};

export default withNextIntl(nextConfig);