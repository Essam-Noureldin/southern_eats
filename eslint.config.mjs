import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * WHAT: ESLint flat config (ESLint 9). Pulls in Next 16's
 *       core-web-vitals + TypeScript rule sets directly from the
 *       package's flat-config exports — no FlatCompat shim required.
 * WHY:  FlatCompat under ESLint 9 + eslint-plugin-react has a
 *       circular-JSON validation bug. Native flat config sidesteps it.
 * IF REMOVED: lint runs with ESLint defaults — misses Next-specific
 *       rules (no <a> for internal nav, no img tag, etc.).
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "next-sitemap.config.js",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
