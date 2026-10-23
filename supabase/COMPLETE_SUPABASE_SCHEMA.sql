-- ==============================================================================
-- GOSPEL FORGE — PRODUCTION POSTGRESQL SCHEMA & ROW LEVEL SECURITY (RLS)
-- Migration: 20261024000001_production_backend.sql
-- Description: Comprehensive schema supporting RBAC, Artist Applications,
--              Publishing Lifecycle (Draft -> Submitted -> Approved -> Published),
--              Cloudflare R2 Media Tracking, Listener Libraries, and Audit Logging.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE public.app_user_role AS ENUM (
    'listener',
    'editor',
    'admin',
    'super_admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.artist_app_status AS ENUM (
    'none',
    'pending',
    'approved',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.episode_publication_status AS ENUM (
    'draft',
    'submitted',
    'in_review',
    'approved',
    'published',
    'rejected',
    'archived',
    'scheduled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role public.app_user_role DEFAULT 'listener' NOT NULL,
  artist_status public.artist_app_status DEFAULT 'none' NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. ARTIST APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.artist_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ministry_or_band_name TEXT NOT NULL,
  bio TEXT NOT NULL,
  sample_audio_link TEXT,
  social_links JSONB DEFAULT '{}'::jsonb NOT NULL,
  status public.artist_app_status DEFAULT 'pending' NOT NULL,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 5. SPEAKERS / HOSTS TABLE
CREATE TABLE IF NOT EXISTS public.speakers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. SERIES TABLE
CREATE TABLE IF NOT EXISTS public.series (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  artwork_url TEXT NOT NULL,
  banner_url TEXT,
  host_name TEXT NOT NULL,
  host_id UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. EPISODES TABLE (Full Publishing State Machine)
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
  series_title TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  show_notes TEXT,
  transcript TEXT,
  audio_url TEXT NOT NULL,
  audio_storage_key TEXT,
  audio_duration_seconds INTEGER DEFAULT 0 NOT NULL,
  audio_file_size_bytes BIGINT DEFAULT 0 NOT NULL,
  artwork_url TEXT NOT NULL,
  artwork_storage_key TEXT,
  status public.episode_publication_status DEFAULT 'draft' NOT NULL,
  rejection_reason TEXT,
  episode_number INTEGER,
  season_number INTEGER DEFAULT 1,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  speaker_id UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
  topics TEXT[] DEFAULT '{}'::text[] NOT NULL,
  scripture_references TEXT[] DEFAULT '{}'::text[] NOT NULL,
  play_count BIGINT DEFAULT 0 NOT NULL,
  likes_count BIGINT DEFAULT 0 NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  is_explicit BOOLEAN DEFAULT false NOT NULL,
  youtube_url TEXT,
  scheduled_publish_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. MEDIA ASSETS TRACKING (Cloudflare R2 Objects)
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  storage_key TEXT UNIQUE NOT NULL,
  bucket_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'audio', 'artwork', 'banner'
  status TEXT DEFAULT 'pending_upload' NOT NULL, -- 'pending_upload', 'verified', 'associated', 'abandoned'
  associated_episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  verified_at TIMESTAMPTZ
);

-- 9. USER PRIVATE LIBRARIES
CREATE TABLE IF NOT EXISTS public.saved_episodes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, episode_id)
);

CREATE TABLE IF NOT EXISTS public.listening_progress (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  progress_seconds INTEGER DEFAULT 0 NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, episode_id)
);

CREATE TABLE IF NOT EXISTS public.followed_series (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, series_id)
);

CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.playlist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  position INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (playlist_id, episode_id)
);

-- 10. AUDIT LOGS (Immutable Security Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_title TEXT,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. INDEXES FOR HIGH-PERFORMANCE STREAMING & SEARCH
CREATE INDEX IF NOT EXISTS idx_episodes_status ON public.episodes(status);
CREATE INDEX IF NOT EXISTS idx_episodes_published_at ON public.episodes(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_episodes_author ON public.episodes(author_id);
CREATE INDEX IF NOT EXISTS idx_episodes_series ON public.episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_slug ON public.episodes(slug);
CREATE INDEX IF NOT EXISTS idx_artist_apps_status ON public.artist_applications(status);
CREATE INDEX IF NOT EXISTS idx_artist_apps_user ON public.artist_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_episodes_user ON public.saved_episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.listening_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 12. HELPER SECURITY FUNCTIONS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_approved_artist()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (artist_status = 'approved' OR role IN ('editor', 'admin', 'super_admin'))
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 13. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.app_user_role := 'listener';
  v_artist_status public.artist_app_status := 'none';
  v_username TEXT;
  v_display_name TEXT;
BEGIN
  -- Extract initial intent from user metadata
  IF (NEW.raw_user_meta_data->>'is_artist')::boolean = true THEN
    v_artist_status := 'pending';
  END IF;

  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)
  );

  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (
    id,
    email,
    username,
    display_name,
    avatar_url,
    role,
    artist_status
  ) VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_display_name,
    NEW.raw_user_meta_data->>'avatar_url',
    v_role,
    v_artist_status
  ) ON CONFLICT (id) DO NOTHING;

  -- If signing up as creator, record an initial pending application
  IF v_artist_status = 'pending' THEN
    INSERT INTO public.artist_applications (
      user_id,
      ministry_or_band_name,
      bio,
      status
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'ministry_name', v_display_name || ' Ministries'),
      COALESCE(NEW.raw_user_meta_data->>'bio', 'Pending artist applicant.'),
      'pending'
    ) ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 14. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followed_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- A. PROFILES
CREATE POLICY "Public read profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Regular users cannot self-escalate their role or artist status
    AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
    AND (artist_status = (SELECT artist_status FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
  );

-- B. ARTIST APPLICATIONS
CREATE POLICY "Applicants read own applications"
  ON public.artist_applications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users submit application"
  ON public.artist_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update artist applications"
  ON public.artist_applications FOR UPDATE
  USING (public.is_admin());

-- C. SPEAKERS & SERIES
CREATE POLICY "Public read speakers"
  ON public.speakers FOR SELECT
  USING (true);

CREATE POLICY "Admins manage speakers"
  ON public.speakers FOR ALL
  USING (public.is_admin());

CREATE POLICY "Public read series"
  ON public.series FOR SELECT
  USING (true);

CREATE POLICY "Approved creators and admins manage series"
  ON public.series FOR ALL
  USING (public.is_admin() OR (public.is_approved_artist() AND author_id = auth.uid()));

-- D. EPISODES (State Machine Enforcement)
-- 1. Public can read ONLY published episodes
CREATE POLICY "Public read published episodes"
  ON public.episodes FOR SELECT
  USING (status = 'published');

-- 2. Authors can read their own drafts and submissions
CREATE POLICY "Authors read own episodes"
  ON public.episodes FOR SELECT
  USING (auth.uid() = author_id);

-- 3. Admins can read all episodes in any state
CREATE POLICY "Admins read all episodes"
  ON public.episodes FOR SELECT
  USING (public.is_admin());

-- 4. Approved artists can insert new drafts
CREATE POLICY "Approved creators create drafts"
  ON public.episodes FOR INSERT
  WITH CHECK (
    (public.is_approved_artist() OR public.is_admin())
    AND auth.uid() = author_id
    AND status IN ('draft', 'submitted')
  );

-- 5. Authors can update their own episodes ONLY when in 'draft' or 'rejected'
CREATE POLICY "Authors edit own draft episodes"
  ON public.episodes FOR UPDATE
  USING (
    auth.uid() = author_id
    AND status IN ('draft', 'rejected')
  )
  WITH CHECK (
    auth.uid() = author_id
    -- Creator cannot self-promote to 'published' or 'approved'
    AND status IN ('draft', 'submitted')
  );

-- 6. Admins have full update power (approving, rejecting, publishing, archiving)
CREATE POLICY "Admins manage all episodes"
  ON public.episodes FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins delete episodes"
  ON public.episodes FOR DELETE
  USING (public.is_admin());

-- E. MEDIA ASSETS
CREATE POLICY "Users view own uploaded media"
  ON public.media_assets FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Approved creators register uploaded media"
  ON public.media_assets FOR INSERT
  WITH CHECK (
    (public.is_approved_artist() OR public.is_admin())
    AND auth.uid() = user_id
  );

-- F. USER PRIVATE LIBRARIES
CREATE POLICY "User manage saved episodes"
  ON public.saved_episodes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User manage progress"
  ON public.listening_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User manage followed series"
  ON public.followed_series FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User manage playlists"
  ON public.playlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User manage playlist items"
  ON public.playlist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.playlists p
      WHERE p.id = playlist_id AND p.user_id = auth.uid()
    )
  );

-- G. AUDIT LOGS (Append-only by server actions)
CREATE POLICY "Admins view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "System insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
-- ==============================================================================
-- GOSPEL FORGE — REAL ANALYTICS & SECURITY HARDENING
-- Migration: 20261024000002_analytics_and_hardening.sql
-- Description: Adds privacy-conscious play_events table, deduplication indexes,
--              is_super_admin helper function, and role update hardening.
-- ==============================================================================

-- 1. SUPER ADMIN HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. HARDEN PROFILES UPDATE RLS POLICY
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Regular users cannot alter their role or artist status
    AND (
      (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_super_admin())
      AND (artist_status = (SELECT artist_status FROM public.profiles WHERE id = auth.uid()) OR public.is_admin())
    )
  );

-- 3. PLAY EVENTS TABLE FOR REAL AUDIENCE ANALYTICS
CREATE TABLE IF NOT EXISTS public.play_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_hash TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for lightning-fast queries and deduplication lookup
CREATE INDEX IF NOT EXISTS idx_play_events_episode ON public.play_events(episode_id);
CREATE INDEX IF NOT EXISTS idx_play_events_author ON public.play_events(author_id);
CREATE INDEX IF NOT EXISTS idx_play_events_created ON public.play_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_events_dedup ON public.play_events(episode_id, session_hash, created_at DESC);

-- Enable RLS on play_events
ALTER TABLE public.play_events ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated listeners can insert play telemetry
CREATE POLICY "Allow public insert play events"
  ON public.play_events FOR INSERT
  WITH CHECK (true);

-- Authors can view play events for their own episodes; admins can view all
CREATE POLICY "Authors and admins view play events"
  ON public.play_events FOR SELECT
  USING (author_id = auth.uid() OR public.is_admin());
-- =====================================================================
-- GOSPEL FORGE — MIGRATION 20261024000003: SHARED RATE LIMITING
-- =====================================================================
-- Provides database-backed distributed rate limiting for multi-process
-- Node.js runtimes (PM2 cluster mode, container replicas, Hostinger Cloud).
-- Eliminates process-local rate limit bypass across worker threads.
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1,
    reset_at TIMESTAMPTZ NOT NULL
);

-- Enable RLS (Service role only access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public direct access to rate limits table
CREATE POLICY "Service role only access to rate_limits"
    ON public.rate_limits
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Index for efficient cleanup of expired buckets
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON public.rate_limits (reset_at);

-- Atomic rate limit checker function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key TEXT,
    p_max INTEGER,
    p_window_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_now TIMESTAMPTZ := clock_timestamp();
    v_record RECORD;
    v_new_count INTEGER;
    v_reset_at TIMESTAMPTZ;
    v_allowed BOOLEAN;
    v_remaining INTEGER;
    v_reset_seconds INTEGER;
BEGIN
    -- Clear expired key if present
    DELETE FROM public.rate_limits
    WHERE key = p_key AND reset_at <= v_now;

    -- Upsert key bucket
    INSERT INTO public.rate_limits (key, count, reset_at)
    VALUES (p_key, 1, v_now + (p_window_seconds || ' seconds')::INTERVAL)
    ON CONFLICT (key) DO UPDATE
    SET count = public.rate_limits.count + 1
    RETURNING count, reset_at INTO v_record;

    v_new_count := v_record.count;
    v_reset_at := v_record.reset_at;
    v_reset_seconds := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_reset_at - v_now)))::INTEGER);

    IF v_new_count > p_max THEN
        v_allowed := FALSE;
        v_remaining := 0;
    ELSE
        v_allowed := TRUE;
        v_remaining := p_max - v_new_count;
    END IF;

    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'remaining', v_remaining,
        'resetSeconds', v_reset_seconds
    );
END;
$$;
