import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["tests/**", "vitest.config.ts"],
  },
];

export default eslintConfig;
