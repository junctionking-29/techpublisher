/**
 * AdUnit component
 * Renders advertisement slots only when NEXT_PUBLIC_ADS_ENABLED === 'true'.
 * When disabled, it renders an invisible commented slot or minimal placeholder.
 * CRITICAL RULE: Never render inside or directly adjacent to the CodeBox or Countdown.
 */
export default function AdUnit({ slot = 'in-article-banner', format = 'auto' }) {
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === 'true';

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
        {/* Production AdSense snippet or ad exchange container */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '100px' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        ></ins>
        <span>Sponsored Commercial Placement</span>
      </div>
    </aside>
  );
}
