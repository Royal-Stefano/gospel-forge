-- =====================================================================
-- GOSPEL FORGE — MIGRATION 20261024000004: COMMUNITY & SEED FIXTURES
-- =====================================================================
-- Creates tables for Community Discussions, Prayer Requests, Testimonies,
-- Comments, Reactions, and Content Reporting with Row Level Security.
-- =====================================================================

-- 1. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'Discussions', 'Prayer Requests', 'Testimonies', 'Events'
  content TEXT NOT NULL,
  scripture_citation TEXT,
  attached_episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  is_pinned BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. COMMUNITY COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. COMMUNITY LIKES TABLE
CREATE TABLE IF NOT EXISTS public.community_likes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, post_id)
);

-- 4. COMMUNITY REPORTS TABLE (For Content Moderation)
CREATE TABLE IF NOT EXISTS public.community_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'post', 'comment', 'episode'
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_cat ON public.community_posts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON public.community_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_likes_post ON public.community_likes(post_id);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public read for all community posts and comments
CREATE POLICY "Public read community posts"
  ON public.community_posts FOR SELECT
  USING (true);

CREATE POLICY "Public read community comments"
  ON public.community_comments FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users insert community posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors and admins can update/delete their own posts
CREATE POLICY "Authors or admins update community posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = author_id OR public.is_admin());

CREATE POLICY "Authors or admins delete community posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- Authenticated users insert comments
CREATE POLICY "Authenticated users insert community comments"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or admins delete community comments"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- Likes policies
CREATE POLICY "Public read community likes"
  ON public.community_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users manage own likes"
  ON public.community_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reports policies (authenticated users can report, admins can read/update)
CREATE POLICY "Authenticated users insert reports"
  ON public.community_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins manage reports"
  ON public.community_reports FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
