import type { NextConfig } from "next";

function getConfiguredImageHostnames() {
  const hostnames = new Set<string>();
  const rawHosts = process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "";
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    ...rawHosts.split(",").map((entry) => entry.trim()),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const normalizedCandidate = candidate.includes("://")
        ? candidate
        : `https://${candidate}`;
      const url = new URL(normalizedCandidate);
      hostnames.add(url.hostname);
    } catch {
      continue;
    }
  }

  return [...hostnames];
}

const configuredImageHostnames = getConfiguredImageHostnames();

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns:
      configuredImageHostnames.length > 0
        ? configuredImageHostnames.flatMap((hostname) => [
            {
              protocol: "https" as const,
              hostname,
              pathname: "/**",
            },
            {
              protocol: "http" as const,
              hostname,
              pathname: "/**",
            },
          ])
        : [
            {
              protocol: "https",
              hostname: "**",
            },
            {
              protocol: "http",
              hostname: "**",
            },
          ],
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
  },
};

export default nextConfig;
