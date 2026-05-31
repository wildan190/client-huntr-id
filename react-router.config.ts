import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // Ignore well-known and other non-route paths
  ignoredRouteFiles: ["**/*.test.{js,jsx,ts,tsx}", "**/__*"],
} satisfies Config;
