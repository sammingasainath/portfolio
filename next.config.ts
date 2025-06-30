import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/portfolio",
  // TODO: Update basePath if your repository name is not "portfolio"
};

export default nextConfig;
