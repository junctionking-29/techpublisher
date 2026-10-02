const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Affiliate & Advertising Disclosure',
  description: 'Full disclosure regarding how TechPublisher monetizes content through commercial advertisements, affiliate partnerships, and tracked link redemptions.',
  alternates: {
    canonical: `${siteUrl}/disclosure`,
  },
};

export default function DisclosurePage() {
  return (
    <div className="reading-container static-page-wrapper">
      <header className="static-page-header">
        <h1 className="static-page-title">Affiliate & Advertising Disclosure</h1>
        <p className="static-page-updated">Compliance with Federal Trade Commission (FTC) 16 CFR § 255 Guidelines</p>
      </header>

      <section className="static-content">
        <p>
          At <strong>TechPublisher</strong>, editorial integrity and transparent relationships with our readership are paramount. In accordance with Federal Trade Commission guidelines and global consumer protection standards, this document details how our publication generates revenue and how commercial relationships may relate to the links and codes presented on this website.
        </p>

        <h2>1. Affiliate Links and Commission Structures</h2>
        <p>
          Some of the outbound links published on our website, as well as the destination links unlocked via our Instagram video code redemption system, are affiliate links. When a visitor navigates through an affiliate link to an external merchant (such as Amazon, manufacturer storefronts, or specialized software providers) and completes a qualifying purchase, TechPublisher may earn a small referral commission at no additional cost to you.
        </p>
        <p>
          Our participation in affiliate programs does not influence our editorial assessments. Products are selected, evaluated, and scored based entirely on our testing criteria. If a product performs poorly in our lab benchmarks, we report those deficiencies plainly regardless of affiliate commission rates.
        </p>

        <h2>2. Display Advertising & Programmatic Networks</h2>
        <p>
          TechPublisher displays programmatic and direct-sold advertisements on selected article pages. Advertisements are labeled clearly with headings such as “Advertisement” or “Sponsored”. 
        </p>
        <p>
          <strong>Policy on Code Redemption:</strong> To protect our visitors’ focus and user experience, we strictly enforce a policy wherein advertisements and commercial banners are never inserted inside or directly adjacent to our video code entry input box or countdown verification interfaces.
        </p>

        <h2>3. Product Review Units and Loaners</h2>
        <p>
          Hardware manufacturers and press agencies occasionally provide our newsroom with review loaner units or pre-production engineering samples for evaluation. TechPublisher maintains strict rules regarding review hardware:
        </p>
        <ul>
          <li>We never accept gifts, cash incentives, or travel compensation in exchange for positive product coverage.</li>
          <li>We do not submit drafts or preview copies of articles to manufacturers prior to publication.</li>
          <li>Loaner units are returned or securely archived following the conclusion of long-term testing.</li>
        </ul>

        <h2>4. Questions and Consumer Inquiries</h2>
        <p>
          If you have questions regarding any specific link, sponsored module, or commercial partnership, please contact our standards team at <a href="mailto:editorial@techpublisher.example.com">editorial@techpublisher.example.com</a>.
        </p>
      </section>
    </div>
  );
}
