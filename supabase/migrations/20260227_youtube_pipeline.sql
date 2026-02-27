-- YouTube Auto-Extraction Pipeline Tables
-- Created: 2026-02-27

-- ============================================================
-- YT_SOURCES: YouTube channels/playlists to crawl
-- ============================================================
CREATE TABLE IF NOT EXISTS public.yt_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('channel', 'playlist')),
  youtube_id TEXT NOT NULL UNIQUE,
  url TEXT,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_crawled_at TIMESTAMPTZ,
  crawl_frequency_hours INTEGER NOT NULL DEFAULT 12,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.yt_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for service role" ON public.yt_sources
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- YT_CATEGORIES: Use case categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.yt_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '📁',
  color TEXT DEFAULT '#60a5fa',
  sort_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.yt_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for yt_categories" ON public.yt_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Seed initial categories
INSERT INTO public.yt_categories (name, slug, icon, color, sort_order) VALUES
  ('Content Creation', 'content-creation', '✍️', '#a78bfa', 1),
  ('Marketing & SEO', 'marketing-seo', '📈', '#fb923c', 2),
  ('Customer Service', 'customer-service', '🎧', '#4ade80', 3),
  ('Data Analysis', 'data-analysis', '📊', '#60a5fa', 4),
  ('Code Generation', 'code-generation', '💻', '#f472b6', 5),
  ('Automation', 'automation', '⚡', '#fbbf24', 6),
  ('Research', 'research', '🔍', '#34d399', 7),
  ('Education', 'education', '📚', '#818cf8', 8),
  ('Design', 'design', '🎨', '#fb7185', 9),
  ('Business Strategy', 'business-strategy', '🏢', '#94a3b8', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- YT_USE_CASES: Extracted use cases (drafts & published)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.yt_use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  detailed_content TEXT,
  category_id UUID REFERENCES public.yt_categories(id),
  suggested_category TEXT,
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Source info
  source_id UUID REFERENCES public.yt_sources(id),
  source_video_id TEXT NOT NULL,
  source_video_title TEXT,
  source_video_url TEXT,
  source_channel_name TEXT,
  source_channel_id TEXT,
  source_published_at TIMESTAMPTZ,
  
  -- AI extraction metadata
  ai_confidence FLOAT DEFAULT 0,
  ai_model TEXT,
  extraction_metadata JSONB DEFAULT '{}',
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  rejection_reason TEXT,
  published_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.yt_use_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for yt_use_cases" ON public.yt_use_cases
  FOR ALL USING (true) WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_yt_use_cases_status ON public.yt_use_cases(status);
CREATE INDEX IF NOT EXISTS idx_yt_use_cases_category ON public.yt_use_cases(category_id);
CREATE INDEX IF NOT EXISTS idx_yt_use_cases_source_video ON public.yt_use_cases(source_video_id);

-- ============================================================
-- YT_CRAWL_LOG: Track crawl runs
-- ============================================================
CREATE TABLE IF NOT EXISTS public.yt_crawl_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.yt_sources(id),
  videos_found INTEGER DEFAULT 0,
  videos_processed INTEGER DEFAULT 0,
  use_cases_created INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed'))
);

ALTER TABLE public.yt_crawl_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for yt_crawl_log" ON public.yt_crawl_log
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_yt_sources_updated_at') THEN
    CREATE TRIGGER update_yt_sources_updated_at BEFORE UPDATE ON public.yt_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_yt_categories_updated_at') THEN
    CREATE TRIGGER update_yt_categories_updated_at BEFORE UPDATE ON public.yt_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_yt_use_cases_updated_at') THEN
    CREATE TRIGGER update_yt_use_cases_updated_at BEFORE UPDATE ON public.yt_use_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;
