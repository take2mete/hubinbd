import type { MetadataRoute } from "next";

const BASE_URL = "https://www.hubinbd.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/clothing", "/tools", "/computer-work"],
      disallow: [
        "/admin/",
        "/seller/",
        "/api/",
        "/login",
        "/cart",
        "/checkout",
        "/search",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
