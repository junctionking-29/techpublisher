'use client';

import { useEffect } from 'react';

/**
 * AdUnit component
 * Renders advertisement slots only when NEXT_PUBLIC_ADS_ENABLED === 'true'.
 * When disabled, it renders an invisible commented slot or minimal placeholder.
 * CRITICAL RULE: Never render inside or directly adjacent to the CodeBox or Countdown.
 */
export default function AdUnit({ slot = 'in-article-banner', format = 'auto' }) {
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX';

  useEffect(() => {
    if (adsEnabled && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Silently catch ad blocker or script execution prevention
      }
    }
  }, [adsEnabled]);

  if (!adsEnabled) {
    return (
      <aside
        className="ad-slot-comment"
        aria-hidden="true"
        style={{ display: 'none' }}
        data-ad-slot={slot}
      >
        {/* AdSense Slot [${slot}] - Disabled via NEXT_PUBLIC_ADS_ENABLED=false */}
      </aside>
    );
  }

  return (
    <aside className="ad-slot-wrapper" aria-label="Advertisement">
      <div className="ad-label">Advertisement</div>
      <div className="ad-placeholder-box" data-ad-format={format} data-ad-slot={slot}>
        {/* Production Google AdSense container */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '100px' }}
          data-ad-client={adsenseClient}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        ></ins>
        <span>Sponsored Commercial Placement</span>
      </div>
    </aside>
  );
}
