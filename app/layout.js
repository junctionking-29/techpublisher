import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'TechPublisher - Consumer Tech Reviews, Hardware & AI Research',
    template: '%s | TechPublisher',
  },
  description: 'In-depth consumer tech reviews, semiconductor news, and academic research explainers for modern engineers and builders.',
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
    title: 'TechPublisher',
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
};

export default function RootLayout({ children }) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'TechPublisher',
    url: siteUrl,
    logo: `${siteUrl}/favicon.ico`,
    description: 'Independent consumer technology and computing science journal.',
    sameAs: ['https://www.instagram.com/techpublisher'],
  };

  return (
    <html lang="en">
      <head>
        {/*
          ======================================================================
          FUTURE AD NETWORK / GOOGLE ADSENSE SCRIPT PLACEHOLDER
          To enable in production:
          1. Set NEXT_PUBLIC_ADS_ENABLED=true in .env.production
          2. Replace ca-pub-XXXXXXXXXXXXXXXX with your approved AdSense Publisher ID.
          ======================================================================
        */}
        {process.env.NEXT_PUBLIC_ADS_ENABLED === 'true' && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
            crossOrigin="anonymous"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>
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
