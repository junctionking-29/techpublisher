import { createClient } from '@supabase/supabase-js';
import { FALLBACK_ARTICLES, FALLBACK_SETTINGS } from './fallbackData.js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getPublicSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

export function getServiceSupabase() {
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  if (!supabaseUrl || !key) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables');
  }
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });
}

export async function fetchPublishedArticles() {
  try {
    const supabase = getPublicSupabase();
    if (!supabase) return FALLBACK_ARTICLES;

    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, category, author, cover_alt, status, published_at, updated_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_ARTICLES;
    }
    return data;
  } catch (err) {
    console.error('Failed to fetch articles from Supabase, using fallback:', err.message);
    return FALLBACK_ARTICLES;
  }
}

export async function fetchArticleBySlug(slug) {
  try {
    const supabase = getPublicSupabase();
    if (!supabase) {
      return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
    }

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
    }
    return data;
  } catch (err) {
    console.error(`Failed to fetch article ${slug} from Supabase, using fallback:`, err.message);
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
  }
}

export async function fetchArticlesByCategory(category) {
  try {
    const supabase = getPublicSupabase();
    if (!supabase) {
      return FALLBACK_ARTICLES.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }

    const { data, error } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, category, author, cover_alt, status, published_at, updated_at')
      .eq('category', category.toLowerCase())
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_ARTICLES.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }
    return data;
  } catch (err) {
    console.error(`Failed to fetch category ${category} from Supabase, using fallback:`, err.message);
    return FALLBACK_ARTICLES.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }
}

export async function fetchSiteSettings() {
  try {
    const supabase = getPublicSupabase();
    if (!supabase) return FALLBACK_SETTINGS;

    const { data, error } = await supabase
      .from('settings')
      .select('id, default_wait_seconds, scroll_seconds')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_SETTINGS;
    }
    return data;
  } catch (err) {
    console.error('Failed to fetch settings from Supabase, using fallback:', err.message);
    return FALLBACK_SETTINGS;
  }
}
