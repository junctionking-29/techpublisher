import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="site-logo" style={{ marginBottom: '0.75rem' }}>
              <span className="logo-dot" aria-hidden="true"></span>
              TechPublisher
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '380px' }}>
              Independent, rigorous journalism covering next-generation consumer hardware, semiconductor manufacturing, and foundational artificial intelligence research.
            </p>
          </div>

          <div className="footer-col">
            <h4>Sections</h4>
            <ul className="footer-links">
              <li><Link href="/category/gadget-reviews">Gadget Reviews</Link></li>
              <li><Link href="/category/tech-news">Tech News</Link></li>
              <li><Link href="/category/research-explainers">Research Explainers</Link></li>
              <li><Link href="/#redeem-code-box">Redeem Video Link</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company & Legal</h4>
            <ul className="footer-links">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Editorial Contact</Link></li>
              <li><Link href="/disclosure">Affiliate Disclosure</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} TechPublisher Media Group. All rights reserved.</p>
          <p>Designed for fast reading, zero notification bloat, and verified sources.</p>
        </div>
      </div>
    </footer>
  );
}
