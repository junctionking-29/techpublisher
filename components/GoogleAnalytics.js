'use client';

import Script from 'next/script';

/**
 * Google Analytics (GA4) Integration Component
 * Automatically injects the gtag.js script and sets up page tracking
 * when NEXT_PUBLIC_GA_ID (e.g. G-XXXXXXXXXX) is provided.
 */
export default function GoogleAnalytics({ gaId }) {
  if (!gaId) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics-gtag"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
