/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Was `ignoreBuildErrors: true` — that suppression is exactly how two
    // real bugs (undefined `C.acc` in calls/page.tsx and Shell.tsx) shipped
    // silently. Codebase is now confirmed clean via `tsc --noEmit`; keep
    // this false so the next real type error actually fails the build.
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};
module.exports = nextConfig;
