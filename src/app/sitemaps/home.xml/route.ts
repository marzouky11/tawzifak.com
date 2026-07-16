
const baseUrl = 'https://www.tawzifak.com';

function generateHomepageSitemap() {
  const lastmod = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
         <loc>${baseUrl}/</loc>
         <lastmod>${lastmod}</lastmod>
         <changefreq>daily</changefreq>
         <priority>1.0</priority>
     </url>
   </urlset>
 `;
}

export async function GET() {
  const sitemap = generateHomepageSitemap();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
