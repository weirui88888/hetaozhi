import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "t9vftllnu.hd-bkt.clouddn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "t9vftllnu.hd-bkt.clouddn.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
