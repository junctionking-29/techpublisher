const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Understand how TechPublisher collects, processes, and safeguards visitor information, server telemetry, and redemption interactions.',
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="reading-container static-page-wrapper">
      <header className="static-page-header">
        <h1 className="static-page-title">Privacy Policy</h1>
        <p className="static-page-updated">Effective Date: January 1, 2025 · Last Updated: October 2026</p>
      </header>

      <section className="static-content">
        <p>
          This Privacy Policy outlines how <strong>TechPublisher</strong> (“we”, “us”, or “our”) collects, uses, and safeguards information when you visit our website at <code>{siteUrl}</code>, interact with our editorial content, or utilize our link redemption features.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          <strong>Server Log Information:</strong> When you access our pages, our edge hosting infrastructure automatically logs standard network telemetry, including your Internet Protocol (IP) address, browser user-agent, operating system, referrer URL, and timestamps.
        </p>
        <p>
          <strong>Code Redemption Telemetry:</strong> When you submit a video code to unlock a destination link, we record the code submitted and calculate redemption velocity. IP addresses are processed in temporary server memory solely to enforce rate limits (maximum 8 requests per minute) and prevent automated abuse.
        </p>
        <p>
          <strong>Voluntary Inquiries:</strong> If you contact us via email, we retain your email address and message contents to fulfill your request and improve our technical reporting.
        </p>

        <h2>2. Cookies and Tracking Technologies</h2>
        <p>
          We utilize technical session cookies necessary for authenticated administrative management. In addition, we use <strong>Google Analytics</strong> to measure aggregate visitor metrics, traffic patterns, and engagement velocity to continuously improve our journalism.
        </p>
        <p>
          <strong>Google AdSense & Third-Party Advertising:</strong> Third-party vendors, including Google, use cookies to serve advertisements based on a user's prior visits to this website or other websites on the Internet. Google's use of advertising cookies enables it and its partners to serve ads to visitors based on their visit to our sites and/or other sites across the web. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.
        </p>

        <h2>3. How We Use Information</h2>
        <ul>
          <li>To reliably deliver, maintain, and optimize fast editorial reading experiences.</li>
          <li>To enforce security controls, prevent denial-of-service attempts, and protect API integrity.</li>
          <li>To measure aggregate article readability and track non-identifying redemption counts.</li>
        </ul>

        <h2>4. Data Retention & Security</h2>
        <p>
          We do not sell personal data to data brokers. Rate-limiting IP records in memory are automatically cleared on a rotating sliding window. We employ modern cryptographic standards, including HTTPS encryption and HMAC-SHA256 signature verification.
        </p>

        <h2>5. Your Rights and Contact Information</h2>
        <p>
          Depending on your jurisdiction (including the EU GDPR and California CCPA/CPRA), you may have the right to request access to or deletion of any personal data we hold. Direct all data privacy inquiries to <a href="mailto:privacy@techpublisher.example.com">privacy@techpublisher.example.com</a>.
        </p>
      </section>
    </div>
  );
}
