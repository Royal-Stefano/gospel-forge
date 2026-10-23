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
