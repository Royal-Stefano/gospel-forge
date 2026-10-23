-- GOSPEL FORGE DATABASE SCHEMA & RLS POLICIES
-- Production migration for Supabase PostgreSQL

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. USER ROLES ENUM
CREATE TYPE app_role AS ENUM ('listener', 'moderator', 'admin');

-- 3. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role app_role DEFAULT 'listener' NOT NULL,
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. SPEAKERS
CREATE TABLE IF NOT EXISTS public.speakers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. SERIES
CREATE TABLE IF NOT EXISTS public.series (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  artwork_url TEXT NOT NULL,
  banner_url TEXT,
  host_id UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. EPISODES
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  show_notes TEXT,
  transcript TEXT,
  audio_url TEXT NOT NULL,
  artwork_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  episode_number INTEGER,
  season_number INTEGER,
  rss_guid TEXT UNIQUE NOT NULL,
  speaker_id UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
  play_count BIGINT DEFAULT 0 NOT NULL,
  likes_count BIGINT DEFAULT 0 NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. TOPICS & SCRIPTURE
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'topic' NOT NULL -- 'topic' or 'scripture'
);

CREATE TABLE IF NOT EXISTS public.episode_topics (
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (episode_id, topic_id)
);

-- 8. USER PRIVATE LIBRARY
CREATE TABLE IF NOT EXISTS public.saved_episodes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, episode_id)
);

CREATE TABLE IF NOT EXISTS public.listening_progress (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  progress_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, episode_id)
);

CREATE TABLE IF NOT EXISTS public.followed_series (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
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

-- 9. COMMUNITY DISCUSSIONS & MODERATION
CREATE TABLE IF NOT EXISTS public.discussion_threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  scripture_citation TEXT,
  attached_episode_id UUID REFERENCES public.episodes(id) ON DELETE SET NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL,
  replies_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reactions (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'thread', 'comment', 'episode'
  reaction_type TEXT DEFAULT 'like' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, target_id, target_type)
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  moderator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. RSS SYNC RUN LOGS
CREATE TABLE IF NOT EXISTS public.rss_sync_runs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  feed_url TEXT NOT NULL,
  status TEXT NOT NULL,
  episodes_synced INTEGER DEFAULT 0 NOT NULL,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  finished_at TIMESTAMPTZ
);

-- 11. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_episodes_series ON public.episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_slug ON public.episodes(slug);
CREATE INDEX IF NOT EXISTS idx_episodes_published ON public.episodes(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_category ON public.discussion_threads(category);
CREATE INDEX IF NOT EXISTS idx_saved_episodes_user ON public.saved_episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_progress_user ON public.listening_progress(user_id);

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episode_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followed_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_sync_runs ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS FOR EPISODES, SERIES, SPEAKERS
CREATE POLICY "Public read for episodes" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Public read for series" ON public.series FOR SELECT USING (true);
CREATE POLICY "Public read for speakers" ON public.speakers FOR SELECT USING (true);
CREATE POLICY "Public read for topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Public read for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read for discussions" ON public.discussion_threads FOR SELECT USING (true);
CREATE POLICY "Public read for comments" ON public.comments FOR SELECT USING (true);

-- USER PRIVATE LIBRARY POLICIES
CREATE POLICY "Users read own saved episodes" ON public.saved_episodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved episodes" ON public.saved_episodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saved episodes" ON public.saved_episodes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users manage own progress" ON public.listening_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own playlists" ON public.playlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own followed series" ON public.followed_series FOR ALL USING (auth.uid() = user_id);

-- COMMUNITY DISCUSSIONS CREATION
CREATE POLICY "Authenticated users can create threads" ON public.discussion_threads FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authenticated users can react" ON public.reactions FOR ALL USING (auth.uid() = user_id);
