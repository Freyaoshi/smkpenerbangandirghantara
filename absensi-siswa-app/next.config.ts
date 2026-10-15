import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  env: {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL || "file:sqlite.db",
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "dirghantara-secret-key-32chars-minimum-123456789",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  },
};

export default nextConfig;
