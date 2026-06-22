import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/model_arch",
  images: { unoptimized: true },
};

export default nextConfig;
