import Link from 'next/link';
import { fetchArticlesByCategory } from '@/lib/supabaseServer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function formatCategoryTitle(slug) {
  if (!slug) return 'Category';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

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

export async function generateMetadata({ params }) {
  const { name } = await params;
  const categoryTitle = formatCategoryTitle(name);

  return {
    title: `${categoryTitle} Articles & Coverage`,
    description: `Read the latest ${categoryTitle.toLowerCase()} analysis, technical breakdowns, and verified dispatches from TechPublisher.`,
    alternates: {
      canonical: `${siteUrl}/category/${name}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { name } = await params;
  const categoryTitle = formatCategoryTitle(name);
  const articles = await fetchArticlesByCategory(name);

  return (
    <div className="container" style={{ padding: '3rem 1.25rem' }}>
      <header style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--text-primary)', paddingBottom: '1rem' }}>
        <span className="hero-tag">Category Dispatches</span>
        <h1 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{categoryTitle}</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
          Explore our complete archive of technical reporting, reviews, and explainers in {categoryTitle.toLowerCase()}.
        </p>
      </header>

      {articles.length === 0 ? (
        <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No published articles found in this category.</p>
          <Link href="/" className="btn-secondary" style={{ display: 'inline-block', marginTop: '1rem' }}>
            View All Dispatches
          </Link>
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <article key={article.id} className="article-card">
              <div className="card-category">{categoryTitle}</div>
              <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className="card-excerpt">{article.excerpt}</p>
              <div className="card-meta">
                <span>{article.author || 'Editorial Team'}</span>
                <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
