import type { MetadataRoute } from "next";

const BASE_URL = "https://hooprlab.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/coach", "/api"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
