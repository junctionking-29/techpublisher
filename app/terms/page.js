const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions governing the access, browsing, and use of the TechPublisher editorial platform.',
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="reading-container static-page-wrapper">
      <header className="static-page-header">
        <h1 className="static-page-title">Terms of Service</h1>
        <p className="static-page-updated">Effective Date: January 1, 2025 · Last Updated: October 2026</p>
      </header>

      <section className="static-content">
        <p>
          Welcome to <strong>TechPublisher</strong>. By accessing or using our website, APIs, or content services, you agree to be bound by the terms, conditions, and notices contained or referenced herein.
        </p>

        <h2>1. Intellectual Property Rights</h2>
        <p>
          All editorial articles, original photography, benchmark diagrams, code explainers, and site software are the intellectual property of TechPublisher and its contributors, protected under international copyright and trademark laws.
        </p>
        <p>
          You may quote brief excerpts (up to 150 words) for educational or critical review purposes, provided clear attribution and a direct hyperlink to the original TechPublisher article are provided. Bulk reproduction, unauthorized scraping, or automated AI model pretraining on our articles is expressly prohibited.
        </p>

        <h2>2. Permitted Use & Code Redemption</h2>
        <p>
          Our video redemption system is provided for consumer readers to access verified destination links referenced in our video broadcasts. You agree not to:
        </p>
        <ul>
          <li>Bypass or script automated attacks against our rate limiting mechanisms or API endpoints.</li>
          <li>Forge, alter, or manipulate HMAC cryptographic redemption tokens.</li>
          <li>Submit malformed payloads or exploit serverless execution environments.</li>
        </ul>

        <h2>3. Disclaimer of Warranties</h2>
        <p>
          All information and technical benchmark data are provided on an “as is” and “as available” basis without warranty of any kind. While our newsroom makes exhaustive efforts to verify engineering claims, hardware manufacturers frequently modify firmware, yields, and specifications post-launch. TechPublisher disclaims liability for any decisions made based upon published commentary.
        </p>

        <h2>4. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.
        </p>

        <h2>5. Modifications</h2>
        <p>
          We reserve the right to revise these Terms at our discretion. Continued use of the platform following the posting of modifications constitutes acceptance of the amended terms.
        </p>
      </section>
    </div>
  );
}
