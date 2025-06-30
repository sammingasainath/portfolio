import type { NextConfig } from "next";

const basePath = "/portfolio";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // TODO: Update basePath if your repository name is not "portfolio"
};

export default nextConfig;
