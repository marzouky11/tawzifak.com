import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/layout/app-layout';
import Script from 'next/script';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tawzifak.com'),
  title: {
    default: 'توظيفك',
    template: `%s | توظيفك`
  },
  description: "تعرّف على أفضل عروض العمل بالمغرب وفرص الهجرة القانونية والمباريات العمومية بسهولة وموثوقية. اعثر على الفرص التي تناسب مهاراتك وطموحاتك المهنية بسرعة وفعالية وابدأ رحلتك نحو مستقبل مهني ناجح.",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: {
      default: 'توظيفك',
      template: `%s | توظيفك`
    },
    description: "تعرّف على أفضل عروض العمل بالمغرب وفرص الهجرة القانونية والمباريات العمومية بسهولة وموثوقية. اعثر على الفرص التي تناسب مهاراتك وطموحاتك المهنية بسرعة وفعالية وابدأ رحلتك نحو مستقبل مهني ناجح.",
    url: '/',
    siteName: 'توظيفك',
    images: [
      {
        url: 'https://www.tawzifak.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'توظيفك',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: 'توظيفك',
      template: `%s | توظيفك`
    },
    description: "تعرّف على أفضل عروض العمل بالمغرب وفرص الهجرة القانونية والمباريات العمومية بسهولة وموثوقية. اعثر على الفرص التي تناسب مهاراتك وطموحاتك المهنية بسرعة وفعالية وابدأ رحلتك نحو مستقبل مهني ناجح.",
    images: ['https://www.tawzifak.com/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'توظيفك',
    url: 'https://www.tawzifak.com',
    logo: 'https://www.tawzifak.com/og-image.jpg',
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'توظيفك',
    url: 'https://www.tawzifak.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: `https://www.tawzifak.com/jobs?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className={cn("antialiased", tajawal.variable)}>
        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6413953433245789"
          crossOrigin="anonymous"
        />
        <Script
          async
          id="gtag-manager"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-FE0MP7XYXM"
        />
        <Script id="gtag-inline" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FE0MP7XYXM');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
    }
