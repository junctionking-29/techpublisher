-- ==============================================================================
-- TechPublisher Database Schema Migration
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Table: articles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body TEXT NOT NULL, -- plain text, paragraphs separated by blank lines
  category TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Editorial Team',
  cover_alt TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by slug and category filtering
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_status ON public.articles(status, published_at DESC);

-- Trigger function for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_articles_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
CREATE TRIGGER trg_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_articles_timestamp();

-- ------------------------------------------------------------------------------
-- 2. Table: codes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.codes (
  code TEXT PRIMARY KEY, -- uppercase unique code
  target_url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  wait_seconds INT CHECK (wait_seconds IS NULL OR (wait_seconds >= 0 AND wait_seconds <= 30)),
  click_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup for active codes
CREATE INDEX IF NOT EXISTS idx_codes_active ON public.codes(code, active);

-- Helper RPC function to atomically increment click count
CREATE OR REPLACE FUNCTION public.increment_code_clicks(code_input TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.codes
  SET click_count = click_count + 1
  WHERE code = code_input;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. Table: settings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settings (
  id INT PRIMARY KEY CHECK (id = 1),
  default_wait_seconds INT NOT NULL DEFAULT 8 CHECK (default_wait_seconds BETWEEN 0 AND 30),
  scroll_seconds INT NOT NULL DEFAULT 40 CHECK (scroll_seconds BETWEEN 0 AND 180)
);

-- Seed default singleton settings record
INSERT INTO public.settings (id, default_wait_seconds, scroll_seconds)
VALUES (1, 8, 40)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Articles RLS Policies:
-- Public visitors can only view published articles
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles"
ON public.articles FOR SELECT
USING (status = 'published');

-- Authenticated admin users have full CRUD access to articles
DROP POLICY IF EXISTS "Admins full access to articles" ON public.articles;
CREATE POLICY "Admins full access to articles"
ON public.articles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Settings RLS Policies:
-- Public can view site settings (for countdown wait default & auto-scroll duration)
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
CREATE POLICY "Public can view settings"
ON public.settings FOR SELECT
USING (true);

-- Authenticated admin users can update settings
DROP POLICY IF EXISTS "Admins full access to settings" ON public.settings;
CREATE POLICY "Admins full access to settings"
ON public.settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Codes RLS Policies:
-- CRITICAL SECURITY REQUIREMENT: NO public policy on codes!
DROP POLICY IF EXISTS "Admins full access to codes" ON public.codes;
CREATE POLICY "Admins full access to codes"
ON public.codes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
