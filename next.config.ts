import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // ioredis solo corre en el servidor de Next
  serverExternalPackages: ["ioredis"],
};

export default nextConfig;
