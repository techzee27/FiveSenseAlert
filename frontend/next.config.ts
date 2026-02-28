import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  /* config options here */
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "fluent-ffmpeg"],
};

export default nextConfig;
