import { getCatalogues } from "../lib/api";

export async function loader() {
  let products: any[] = [];
  try {
    const res = await getCatalogues({ page: 1 });
    if (res && Array.isArray(res.data)) {
      products = res.data;
    } else if (Array.isArray(res)) {
      products = res;
    }
  } catch (err) {
    console.error("Failed to load catalog for sitemap", err);
  }

  const baseUrl = "https://app.huntr.id";

  const urls = [
    { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${baseUrl}/marketplace`, changefreq: "daily", priority: "0.8" },
    ...products.map((item) => ({
      loc: `${baseUrl}/marketplace/${item.id}`,
      changefreq: "weekly",
      priority: "0.6",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (u) => `<url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n  ")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
