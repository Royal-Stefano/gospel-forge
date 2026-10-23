"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Episode } from "@/types";

interface AudioPlayerContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  playbackError: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  queue: Episode[];
  isQueueOpen: boolean;
  isNowPlayingExpanded: boolean;
  savedEpisodeIds: string[];
  playEpisode: (episode: Episode) => void;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  skipBackward: (seconds?: number) => void;
  skipForward: (seconds?: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  addToQueue: (episode: Episode) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleQueue: () => void;
  toggleNowPlayingExpanded: (open?: boolean) => void;
  toggleSaveEpisode: (episodeId: string) => Promise<void>;
  isEpisodeSaved: (episodeId: string) => boolean;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export function AudioPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [queue, setQueue] = useState<Episode[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isNowPlayingExpanded, setIsNowPlayingExpanded] = useState<boolean>(false);
  const [savedEpisodeIds, setSavedEpisodeIds] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackedPlaysRef = useRef<Set<string>>(new Set());
  const lastSyncTimeRef = useRef<number>(0);

  // Initialize Audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Persist progress locally and to server
      if (currentEpisode) {
        try {
          localStorage.setItem(
            `gospel_progress_${currentEpisode.id}`,
            audio.currentTime.toString()
          );
        } catch {}

        // Sync with server every 10 seconds of playback
        const now = Date.now();
        if (now - lastSyncTimeRef.current > 10000) {
          lastSyncTimeRef.current = now;
          fetch("/api/library/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              episodeId: currentEpisode.id,
              progressSeconds: audio.currentTime,
              completed: audio.duration ? audio.currentTime / audio.duration >= 0.9 : false,
            }),
          }).catch(() => {});
        }

        // Trigger real play event after 10s of confirmed playback
        if (
          audio.currentTime >= 10 &&
          !trackedPlaysRef.current.has(currentEpisode.id)
        ) {
          trackedPlaysRef.current.add(currentEpisode.id);
          fetch("/api/analytics/track-play", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              episodeId: currentEpisode.id,
              durationSeconds: Math.round(audio.currentTime),
            }),
          }).catch(() => {});
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setPlaybackError(null);
    };

    const handlePause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsBuffering(false);
      setIsPlaying(false);
      setPlaybackError("Audio stream temporarily unavailable.");
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    // Load saved IDs from local storage
    try {
      const saved = localStorage.getItem("gospel_saved_episodes");
      if (saved) {
        setSavedEpisodeIds(JSON.parse(saved));
      }
    } catch {}

    // Fetch authenticated library saved episodes
    fetch("/api/library")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && Array.isArray(data.savedEpisodes)) {
          const ids = data.savedEpisodes.map((e: any) => e.id);
          setSavedEpisodeIds(ids);
          try {
            localStorage.setItem("gospel_saved_episodes", JSON.stringify(ids));
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Update src when currentEpisode changes
  useEffect(() => {
    if (!audioRef.current || !currentEpisode) return;

    setPlaybackError(null);
    setIsLoading(true);

    const isDifferentSrc = audioRef.current.src !== currentEpisode.audioUrl;
    if (isDifferentSrc) {
      audioRef.current.src = currentEpisode.audioUrl;
      audioRef.current.load();
      setDuration(currentEpisode.durationSeconds || 0);
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentEpisode]);

  const playEpisode = useCallback((episode: Episode) => {
    setCurrentEpisode(episode);
    setDuration(episode.durationSeconds || 0);
    setPlaybackError(null);
    setIsLoading(true);

    if (audioRef.current) {
      audioRef.current.src = episode.audioUrl;
      try {
        const savedProgress = localStorage.getItem(`gospel_progress_${episode.id}`);
        if (savedProgress && !isNaN(Number(savedProgress))) {
          audioRef.current.currentTime = Number(savedProgress);
          setCurrentTime(Number(savedProgress));
        } else {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
        }
      } catch {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentEpisode) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setPlaybackError(null);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [isPlaying, currentEpisode]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const skipBackward = useCallback((seconds: number = 15) => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - seconds);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const skipForward = useCallback((seconds: number = 30) => {
    if (audioRef.current) {
      const maxDuration = audioRef.current.duration || duration || Infinity;
      const newTime = Math.min(maxDuration, audioRef.current.currentTime + seconds);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const addToQueue = useCallback((episode: Episode) => {
    setQueue((prev) => [...prev, episode]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextEp = queue[0];
      setQueue((prev) => prev.slice(1));
      playEpisode(nextEp);
    }
  }, [queue, playEpisode]);

  const playPrevious = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, []);

  const toggleQueue = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  const toggleNowPlayingExpanded = useCallback((open?: boolean) => {
    setIsNowPlayingExpanded((prev) => (open !== undefined ? open : !prev));
  }, []);

  const toggleSaveEpisode = useCallback(
    async (episodeId: string) => {
      setSavedEpisodeIds((prev) => {
        const exists = prev.includes(episodeId);
        const updated = exists
          ? prev.filter((id) => id !== episodeId)
          : [...prev, episodeId];
        try {
          localStorage.setItem("gospel_saved_episodes", JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Sync with backend API
      try {
        await fetch("/api/library/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ episodeId }),
        });
      } catch {}
    },
    []
  );

  const isEpisodeSaved = useCallback(
    (episodeId: string) => savedEpisodeIds.includes(episodeId),
    [savedEpisodeIds]
  );

  return (
    <AudioPlayerContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        isLoading,
        isBuffering,
        playbackError,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        queue,
        isQueueOpen,
        isNowPlayingExpanded,
        savedEpisodeIds,
        playEpisode,
        togglePlay,
        pause,
        seek,
        skipBackward,
        skipForward,
        setVolume,
        toggleMute,
        setPlaybackRate,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playNext,
        playPrevious,
        toggleQueue,
        toggleNowPlayingExpanded,
        toggleSaveEpisode,
        isEpisodeSaved,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
