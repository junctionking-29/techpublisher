import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="container header-inner">
        <Link href="/" className="site-logo" aria-label="TechPublisher Home">
          <span className="logo-dot" aria-hidden="true"></span>
          TechPublisher
        </Link>
        <nav className="site-nav" aria-label="Main Navigation">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/category/gadget-reviews" className="nav-link">Gadget Reviews</Link>
          <Link href="/category/tech-news" className="nav-link">Tech News</Link>
          <Link href="/category/research-explainers" className="nav-link">Research</Link>
          <Link href="/about" className="nav-link">About</Link>
        </nav>
      </div>
    </header>
  );
}
