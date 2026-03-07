const nextConfig = {
  /* config options here */
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg", "fluent-ffmpeg"],

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
