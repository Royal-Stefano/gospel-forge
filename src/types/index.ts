export type UserRole = "listener" | "editor" | "admin" | "super_admin";
export type AccountStatus = "active" | "suspended" | "pending_verification";
export type PublicationStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "published"
  | "rejected"
  | "archived"
  | "scheduled";
export type ArtistStatus = "none" | "pending" | "approved" | "rejected";

export interface ArtistApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ministryOrBandName: string;
  bio: string;
  sampleAudioLink?: string;
  status: ArtistStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  displayName: string;
  name?: string;
  avatarUrl: string;
  role: UserRole;
  status: AccountStatus;
  artistStatus?: ArtistStatus;
  artistApplication?: ArtistApplication;
  bio?: string;
  createdAt: string;
  lastSignInAt?: string;
}

export type PendingAuthAction =
  | { type: "save_episode"; episodeId: string; episodeTitle?: string }
  | { type: "create_playlist" }
  | { type: "post_comment"; content: string; category?: string }
  | { type: "like_post"; postId: string }
  | { type: "follow_series"; seriesId: string }
  | { type: "view_profile" };

export interface Speaker {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  bio?: string;
  seriesCount?: number;
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  description: string;
  artworkUrl: string;
  bannerUrl?: string;
  hostName: string;
  hostId?: string;
  category: string;
  episodeCount: number;
  featured?: boolean;
}

export interface Episode {
  id: string;
  seriesId: string;
  seriesTitle: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  showNotes?: string;
  transcript?: string;
  audioUrl: string;
  artworkUrl: string;
  bannerUrl?: string;
  speakerId?: string;
  durationSeconds: number;
  publishedAt: string;
  publishDate?: string;
  scheduledPublishAt?: string;
  status?: PublicationStatus;
  episodeNumber?: number;
  seasonNumber?: number;
  speaker: Speaker;
  topics: string[];
  scriptureReferences: string[];
  playCount?: number;
  likesCount?: number;
  featured?: boolean;
  isExplicit?: boolean;
  youtubeUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  authorId?: string;
  authorName?: string;
  lastEditedById?: string;
  lastEditedByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  episodeId: string;
  addedAt: string;
  episode: Episode;
}

export interface Playlist {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  coverUrl?: string;
  artworkUrl?: string;
  isPublic?: boolean;
  itemCount?: number;
  episodeCount?: number;
  updatedAt?: string;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  playlistsCount: number;
  followingCount: number;
  followersCount: number;
  savedEpisodesCount: number;
}

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
  };
  category:
    | "Discussions"
    | "Prayer Requests"
    | "Testimonies"
    | "Events"
    | "Discipleship"
    | "Prayer & Praise";
  content: string;
  scriptureCitation?: string;
  attachedEpisodeId?: string;
  attachedEpisodeTitle?: string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  createdAt: string;
  isModerated?: boolean;
}

export interface AudioPlaybackState {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  queue: Episode[];
  isQueueOpen: boolean;
  isNowPlayingExpanded: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetType: "episode" | "user" | "role" | "community" | "settings" | "rss" | "artist";
  targetId: string;
  targetTitle?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ModerationReport {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  content: string;
  authorName: string;
  authorId: string;
  reportedBy: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  reportedAt: string;
}
