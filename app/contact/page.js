const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Editorial & Research Contact',
  description: 'Contact the TechPublisher newsroom for tips, technical inquiries, peer-review feedback, or corporate press releases.',
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="reading-container static-page-wrapper">
      <header className="static-page-header">
        <h1 className="static-page-title">Contact Our Editorial Desk</h1>
        <p className="static-page-updated">Direct Communication Channels for Readers, Researchers & Whistleblowers</p>
      </header>

      <section className="static-content">
        <p>
          We encourage direct communication from researchers, industry engineers, hardware tinkerers, and our readers. Whether submitting a confidential hardware benchmark, requesting an errata correction, or pitching a technical explainer, please use the appropriate channel below.
        </p>

        <h2>Newsroom & Story Pitches</h2>
        <p>
          For general press releases, product review unit requests, and story tips:
          <br />
          <strong>Email:</strong> <a href="mailto:editorial@techpublisher.example.com">editorial@techpublisher.example.com</a>
        </p>

        <h2>Confidential Tips & Hardware Leaks</h2>
        <p>
          If you are an insider sharing non-public technical specifications, engineering schematics, or regulatory filings:
          <br />
          <strong>Secure Signal / Wire:</strong> <code>+1 (555) 019-2834</code>
          <br />
          <strong>PGP Fingerprint:</strong> <code>4A9F B32C 7E10 8891 03FA 5B12 90D3 44FE</code>
          <br />
          We never disclose confidential sources or retain identifiable connection logs when handling technical leaks.
        </p>

        <h2>Corrections & Clarifications</h2>
        <p>
          Accuracy is the bedrock of our reporting. If you identify a factual error, misattributed citation, or broken video redemption code, email our standards editor directly at:
          <br />
          <strong>Email:</strong> <a href="mailto:corrections@techpublisher.example.com">corrections@techpublisher.example.com</a>
          <br />
          We append formal public corrections to the bottom of revised articles in full transparency.
        </p>

        <h2>Commercial & Syndicate Inquiries</h2>
        <p>
          For licensing our technical benchmarking charts, syndication rights, or advertising sponsorships:
          <br />
          <strong>Email:</strong> <a href="mailto:business@techpublisher.example.com">business@techpublisher.example.com</a>
        </p>
      </section>
    </div>
  );
}
