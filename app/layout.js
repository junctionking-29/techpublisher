import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://techpublisher.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TechPublisher - Consumer Tech Reviews, Hardware & AI Research',
    template: '%s | TechPublisher',
  },
  description: 'In-depth consumer tech reviews, semiconductor news, and academic research explainers for modern engineers and builders.',
  keywords: [
    'TechPublisher',
    'Tech Reviews',
    'Hardware Analysis',
    'Semiconductors',
    'AI Research',
    'Gadget Reviews',
    'E-Ink Tablet Review',
    'Transistors',
    'Direct Preference Optimization',
  ],
  authors: [{ name: 'TechPublisher Editorial Team', url: siteUrl }],
  creator: 'TechPublisher',
  publisher: 'TechPublisher',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'TechPublisher',
    title: 'TechPublisher - Consumer Tech Reviews, Hardware & AI Research',
    description: 'In-depth consumer tech reviews, semiconductor news, and academic research explainers for modern engineers and builders.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TechPublisher - Consumer Tech Reviews, Hardware & AI Research',
    description: 'In-depth consumer tech reviews, semiconductor news, and academic research explainers.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  other: {
    ...(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && {
      'google-adsense-account': process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
    }),
  },
};

export default function RootLayout({ children }) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'TechPublisher',
    url: siteUrl,
    logo: `${siteUrl}/icon`,
    description: 'Independent consumer technology and computing science journal.',
    sameAs: ['https://www.instagram.com/techpublisher'],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TechPublisher',
    url: siteUrl,
    description: 'In-depth consumer tech reviews, semiconductor news, and academic research explainers.',
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'TechPublisher',
      url: siteUrl,
      logo: `${siteUrl}/icon`,
    },
  };

  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX';
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

  return (
    <html lang="en">
      <head>
        {/* Google AdSense Script (Active only when NEXT_PUBLIC_ADS_ENABLED=true) */}
        {adsEnabled && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Schema.org NewsMediaOrganization & WebSite Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        {/* Google Analytics (GA4) Tracker */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />

        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
