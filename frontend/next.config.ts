import type { NextConfig } from "next";

const nextConfig: any = {
  /* config options here */
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "fluent-ffmpeg"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
