import type { NextConfig } from "next";

// Creator short links: hooprlab.com/<path> → App Store with that creator's campaign token,
// so App Store Connect → Analytics → Campaigns shows installs per creator.
// Add a creator: one line here, then push. ct must stay the same once shared.
const APP_STORE = "https://apps.apple.com/app/apple-store/id6774494139?pt=128968531&mt=8&ct=";
const CREATORS: Record<string, string> = {
  sandwich: "Sandwich",
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(CREATORS).flatMap(([path, ct]) =>
      [path, path[0].toUpperCase() + path.slice(1), path.toUpperCase()].map((p) => ({
        source: `/${p}`,
        destination: APP_STORE + encodeURIComponent(ct),
        permanent: false,
      }))
    );
  },
};

export default nextConfig;
