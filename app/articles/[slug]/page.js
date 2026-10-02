import { notFound } from 'next/navigation';
import Link from 'next/link';
import CodeBox from '@/components/CodeBox';
import AutoScroll from '@/components/AutoScroll';
import AdUnit from '@/components/AdUnit';
import { fetchArticleBySlug, fetchSiteSettings, fetchPublishedArticles } from '@/lib/supabaseServer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function formatDate(dateString) {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'long',
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

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const canonicalUrl = `${siteUrl}/articles/${article.slug}`;

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      type: 'article',
      publishedTime: article.published_at,
      modifiedTime: article.updated_at || article.published_at,
      authors: [article.author || 'Editorial Team'],
      section: formatCategoryName(article.category),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const settings = await fetchSiteSettings();
  const scrollSeconds = typeof settings?.scroll_seconds === 'number' ? settings.scroll_seconds : 40;

  // Split plain text body into paragraphs
  const paragraphs = article.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Schema: Article JSON-LD
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: [
      {
        '@type': 'Person',
        name: article.author || 'Editorial Team',
      },
    ],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'TechPublisher',
      url: siteUrl,
      logo: `${siteUrl}/favicon.ico`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/articles/${article.slug}`,
    },
  };

  // Schema: BreadcrumbList JSON-LD
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: formatCategoryName(article.category),
        item: `${siteUrl}/category/${article.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${siteUrl}/articles/${article.slug}`,
      },
    ],
  };

  return (
    <article className="reading-container article-page">
      {/* Structured SEO Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      {/* Auto-Scroll Client Component */}
      <AutoScroll scrollSeconds={scrollSeconds} targetId="article-code-box" />

      {/* Article Header */}
      <header className="article-header">
        <div className="article-meta-top">
          <Link
            href={`/category/${article.category}`}
            className="article-category-badge"
          >
            {formatCategoryName(article.category)}
          </Link>
          <time dateTime={article.published_at} style={{ color: 'var(--text-tertiary)' }}>
            {formatDate(article.published_at)}
          </time>
        </div>

        <h1 className="article-page-title">{article.title}</h1>
        <p className="article-page-excerpt">{article.excerpt}</p>

        <div className="article-byline">
          <span>By <strong>{article.author || 'Editorial Team'}</strong></span>
          <span>Verified Technical Review</span>
        </div>
      </header>

      {/* Article Body */}
      <div className="article-body">
        {paragraphs.map((p, index) => {
          // Mid-article ad slot placement (around middle of article, never next to code box)
          const isMidpoint = index === Math.floor(paragraphs.length / 2);

          return (
            <div key={index}>
              <p>{p}</p>
              {isMidpoint && paragraphs.length > 3 && (
                <AdUnit slot="article-inline-mid" format="fluid" />
              )}
            </div>
          );
        })}
      </div>

      {/* Code Box at the very end of the article */}
      <div className="article-end-section">
        {/* Note: Never show any ads or ad placeholders inside or next to the code box or countdown */}
        <CodeBox id="article-code-box" />
      </div>
    </article>
  );
}
