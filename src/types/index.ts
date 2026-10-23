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
  showNotes?: string;
  transcript?: string;
  audioUrl: string;
  artworkUrl: string;
  durationSeconds: number;
  publishedAt: string;
  episodeNumber?: number;
  seasonNumber?: number;
  speaker: Speaker;
  topics: string[];
  scriptureReferences: string[];
  playCount: number;
  likesCount: number;
  featured?: boolean;
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
  userId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
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
  category: "Discussions" | "Prayer Requests" | "Testimonies" | "Events";
  content: string;
  scriptureCitation?: string;
  attachedEpisodeId?: string;
  attachedEpisodeTitle?: string;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean;
  createdAt: string;
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
