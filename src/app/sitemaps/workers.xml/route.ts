// This file is intentionally left blank to prevent the generation of a sitemap for worker profiles.
// Worker profiles are set to noindex, so they should not appear in any sitemap.

export async function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   </urlset>
 `;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
