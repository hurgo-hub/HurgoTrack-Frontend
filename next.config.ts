import type { NextConfig } from "next";

/** API real del backend (Django). El navegador nunca la llama directo: pasa por /backend (mismo origen, sin CORS). */
const BACKEND_URL = (process.env.BACKEND_URL ?? "https://hurgotrackback.devloop.com.co/api").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Imagen Docker liviana: .next/standalone trae server.js y solo las dependencias usadas
  output: "standalone",
  reactCompiler: true,
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  // ioredis solo corre en el servidor de Next
  serverExternalPackages: ["ioredis"],
  // Django termina sus rutas en "/": no quitarla al reenviar
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/backend/:path*/", destination: `${BACKEND_URL}/:path*/` },
      { source: "/backend/:path*", destination: `${BACKEND_URL}/:path*` },
    ];
  },
};

export default nextConfig;
