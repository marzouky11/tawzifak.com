

const baseUrl = 'https://www.tawzifak.com';

function generateSitemapIndex() {
    const sitemaps = [
        'sitemaps/home.xml',
        'sitemaps/static.xml',
        'sitemaps/jobs.xml',
        'sitemaps/articles.xml',
        'sitemaps/competitions.xml',
        'sitemaps/immigration.xml',
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
   <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${sitemaps
       .map((sitemap) => {
         return `
       <sitemap>
          <loc>${baseUrl}/${sitemap}</loc>
          <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
       </sitemap>
     `;
       })
       .join('')}
   </sitemapindex>
 `;
}

export async function GET() {
  const sitemapIndex = generateSitemapIndex();

  return new Response(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

