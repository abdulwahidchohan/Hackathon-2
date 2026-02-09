import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone", // temporarily disable standalone
  serverExternalPackages: ["better-sqlite3"],
  webpack: (config) => {
    config.externals = [...(config.externals || []), "better-sqlite3"];
    return config;
  },
};
export default nextConfig;
