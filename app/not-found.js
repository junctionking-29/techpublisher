import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found',
  description: 'The requested article or page could not be located.',
};

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '6rem 1.25rem', textAlign: 'center' }}>
      <div className="hero-tag" style={{ marginBottom: '1rem' }}>404 Error</div>
      <h1 style={{ marginBottom: '1.25rem' }}>Page Not Found</h1>
      <p style={{ maxWidth: '480px', margin: '0 auto 2rem', color: 'var(--text-secondary)' }}>
        The article or resource you are looking for has been moved, renamed, or is currently unavailable.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
          Return to Homepage
        </Link>
        <Link href="/#redeem-code-box" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Redeem Video Code
        </Link>
      </div>
    </div>
  );
}
