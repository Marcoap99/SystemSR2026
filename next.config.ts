import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // V1.3: las capturas pegadas en las notas de /aprender suben hasta 5MB
  // (límite del bucket 'notas') vía server action.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
