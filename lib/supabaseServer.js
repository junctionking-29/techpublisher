import { createClient } from '@supabase/supabase-js';
import { FALLBACK_ARTICLES, FALLBACK_SETTINGS } from './fallbackData.js';

export function isFallbackAllowed() {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_FALLBACK_DATA === 'true';
}

export function getPublicSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

export function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!supabaseUrl || !key) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables');
  }
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });
}

export async function fetchPublishedArticles() {
  const supabase = getPublicSupabase();
  if (!supabase) {
    if (!isFallbackAllowed()) {
      throw new Error('Supabase is not configured and fallback data is not allowed in this environment.');
    }
    return FALLBACK_ARTICLES;
  }

  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, author, cover_alt, status, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    if (!isFallbackAllowed()) {
      throw new Error(`Failed to fetch articles from Supabase: ${error.message}`);
    }
    console.warn('Supabase fetch failed, serving fallback articles (local dev only).');
    return FALLBACK_ARTICLES;
  }

  if (!data || data.length === 0) {
    if (isFallbackAllowed()) {
      return FALLBACK_ARTICLES;
    }
    return [];
  }

  return data;
}

export async function fetchArticleBySlug(slug) {
  const supabase = getPublicSupabase();
  if (!supabase) {
    if (!isFallbackAllowed()) {
      throw new Error('Supabase is not configured and fallback data is not allowed in this environment.');
    }
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    if (!isFallbackAllowed()) {
      throw new Error(`Failed to fetch article ${slug} from Supabase: ${error.message}`);
    }
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
  }

  if (!data && isFallbackAllowed()) {
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
  }

  return data || null;
}

export async function fetchArticlesByCategory(category) {
  const supabase = getPublicSupabase();
  if (!supabase) {
    if (!isFallbackAllowed()) {
      throw new Error('Supabase is not configured and fallback data is not allowed in this environment.');
    }
    return FALLBACK_ARTICLES.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }

  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, author, cover_alt, status, published_at, updated_at')
    .eq('category', category.toLowerCase())
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    if (!isFallbackAllowed()) {
      throw new Error(`Failed to fetch category ${category} from Supabase: ${error.message}`);
    }
    return FALLBACK_ARTICLES.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }

  if ((!data || data.length === 0) && isFallbackAllowed()) {
    return FALLBACK_ARTICLES.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }

  return data || [];
}

export async function fetchSiteSettings() {
  const supabase = getPublicSupabase();
  if (!supabase) {
    if (!isFallbackAllowed()) {
      throw new Error('Supabase is not configured and fallback data is not allowed in this environment.');
    }
    return FALLBACK_SETTINGS;
  }

  const { data, error } = await supabase
    .from('settings')
    .select('id, default_wait_seconds, scroll_seconds')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) {
    if (!isFallbackAllowed()) {
      throw new Error(`Failed to fetch site settings from Supabase: ${error?.message || 'No settings found'}`);
    }
    return FALLBACK_SETTINGS;
  }

  return data;
}
