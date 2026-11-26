import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // One canonical host: the apex domain permanently redirects to www.
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "ahmedberrada.com" }],
        destination: "https://www.ahmedberrada.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
