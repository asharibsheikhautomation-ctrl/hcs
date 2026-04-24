import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/*", "/admin-login"],
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: getAbsoluteUrl("/"),
  };
}
