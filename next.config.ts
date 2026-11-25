import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O banco SQLite usa um módulo nativo; isso evita que o Next tente empacotá-lo.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
