import Link from 'next/link';
import CodeBox from '@/components/CodeBox';
import { fetchPublishedArticles } from '@/lib/supabaseServer';

export const metadata = {
  title: 'TechPublisher - Consumer Tech, Hardware Insights & Research',
  description: 'In-depth consumer tech reviews, semiconductor news, and academic research explainers for modern engineers and builders.',
  alternates: {
    canonical: '/',
  },
};

function formatDate(dateString) {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatCategoryName(slug) {
  if (!slug) return 'General';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function HomePage() {
  const articles = await fetchPublishedArticles();

  return (
    <div>
      {/* Hero Section with Code Box */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-content">
            <span className="hero-tag">Verified Tech Journalism</span>
            <h1 id="hero-heading" className="hero-headline">
              Deep Technical Analysis on Silicon, Consumer Hardware & AI
            </h1>
            <p className="hero-description">
              Uncompromising reviews, architectural breakdowns, and peer-reviewed computer science explainers. Enter any video code below to immediately unlock linked documentation and resources.
            </p>

            {/* Reusable Code Box */}
            <CodeBox id="redeem-code-box" />
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="articles-section" aria-labelledby="articles-heading">
        <div className="container">
          <div className="section-title">
            <h2 id="articles-heading">Latest Dispatches</h2>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', fontFamily: 'var(--font-sans)' }}>
              <Link href="/category/gadget-reviews">Reviews</Link>
              <Link href="/category/tech-news">Tech News</Link>
              <Link href="/category/research-explainers">Research</Link>
            </div>
          </div>

          <div className="articles-grid">
            {articles.map((article) => (
              <article key={article.id} className="article-card">
                <div className="card-category">
                  <Link href={`/category/${article.category}`}>
                    {formatCategoryName(article.category)}
                  </Link>
                </div>
                <h3 className="card-title">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="card-excerpt">{article.excerpt}</p>
                <div className="card-meta">
                  <span>{article.author || 'Editorial Team'}</span>
                  <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
