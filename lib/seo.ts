import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://hyderabadcheesestore.com";
const DEFAULT_SITE_NAME = "Hyderabad Cheese Store";

function normalizeBaseUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(candidate);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export function getSiteUrl() {
  return normalizeBaseUrl().toString().replace(/\/$/, "");
}

export function getAbsoluteUrl(path = "/") {
  return new URL(path, normalizeBaseUrl()).toString();
}

interface BuildMetadataOptions {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  siteName?: string;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  siteName = DEFAULT_SITE_NAME,
}: BuildMetadataOptions): Metadata {
  const canonicalUrl = getAbsoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: "en_PK",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const defaultKeywords = [
  "Hyderabad Cheese Store",
  "Hyderabad frozen food",
  "Hyderabad dairy store",
  "premium cheese Pakistan",
  "WhatsApp ordering",
  "frozen food delivery Hyderabad",
];
