import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/supplier/", "/checkout/"],
      },
    ],
    sitemap: "https://fulflo.app/sitemap.xml",
  };
}
