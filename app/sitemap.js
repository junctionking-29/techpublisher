import { fetchPublishedArticles } from '@/lib/supabaseServer';

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date();

  // Static site pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/disclosure',
    '/category/gadget-reviews',
    '/category/tech-news',
    '/category/research-explainers',
  ].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/category') ? 0.8 : 0.5,
  }));

  // Published articles
  let articles = [];
  try {
    articles = await fetchPublishedArticles();
  } catch (err) {
    console.warn('Warning: Articles could not be loaded for sitemap, generating static routes only:', err.message);
  }

  const articlePages = (articles || []).map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: new Date(article.updated_at || article.published_at || now),
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  return [...staticPages, ...articlePages];
}
