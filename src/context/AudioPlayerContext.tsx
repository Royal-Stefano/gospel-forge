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
import { EPISODES } from "@/data/mockData";

interface AudioPlayerContextType {
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
  toggleSaveEpisode: (episodeId: string) => void;
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
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(EPISODES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(754); // Default 12:34 to match reference image!
  const [duration, setDuration] = useState<number>(EPISODES[0].durationSeconds);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [queue, setQueue] = useState<Episode[]>(EPISODES.slice(1));
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isNowPlayingExpanded, setIsNowPlayingExpanded] = useState<boolean>(false);
  const [savedEpisodeIds, setSavedEpisodeIds] = useState<string[]>(["ep-1", "ep-2"]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackedPlaysRef = useRef<Set<string>>(new Set());

  // Initialize Audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Persist progress locally
      if (currentEpisode) {
        try {
          localStorage.setItem(
            `gospel_progress_${currentEpisode.id}`,
            audio.currentTime.toString()
          );
        } catch {
          // ignore localStorage error
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
      playNext();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Load saved savedEpisodeIds from localStorage
    try {
      const saved = localStorage.getItem("gospel_saved_episodes");
      if (saved) {
        setSavedEpisodeIds(JSON.parse(saved));
      }
    } catch {
      // fallback
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Update src when currentEpisode changes
  useEffect(() => {
    if (!audioRef.current || !currentEpisode) return;

    const isDifferentSrc = audioRef.current.src !== currentEpisode.audioUrl;
    if (isDifferentSrc) {
      audioRef.current.src = currentEpisode.audioUrl;
      audioRef.current.load();
      setDuration(currentEpisode.durationSeconds);
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentEpisode]);

  const playEpisode = useCallback((episode: Episode) => {
    setCurrentEpisode(episode);
    setDuration(episode.durationSeconds);
    if (audioRef.current) {
      audioRef.current.src = episode.audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentEpisode) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback simulation if autoplay blocked or network issues
          setIsPlaying(true);
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
    } else {
      setCurrentTime(time);
    }
  }, []);

  const skipBackward = useCallback((seconds = 15) => {
    if (audioRef.current) {
      const newTime = Math.max(0, audioRef.current.currentTime - seconds);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const skipForward = useCallback((seconds = 30) => {
    if (audioRef.current) {
      const newTime = Math.min(
        duration,
        audioRef.current.currentTime + seconds
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  }, [isMuted]);

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
      const next = queue[0];
      setQueue((prev) => prev.slice(1));
      playEpisode(next);
    }
  }, [queue, playEpisode]);

  const playPrevious = useCallback(() => {
    if (currentTime > 5) {
      seek(0);
    } else {
      // Re-seek to 0
      seek(0);
    }
  }, [currentTime, seek]);

  const toggleQueue = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  const toggleNowPlayingExpanded = useCallback((open?: boolean) => {
    setIsNowPlayingExpanded((prev) => (open !== undefined ? open : !prev));
  }, []);

  const toggleSaveEpisode = useCallback((episodeId: string) => {
    setSavedEpisodeIds((prev) => {
      const exists = prev.includes(episodeId);
      const updated = exists
        ? prev.filter((id) => id !== episodeId)
        : [...prev, episodeId];
      try {
        localStorage.setItem("gospel_saved_episodes", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const isEpisodeSaved = useCallback(
    (episodeId: string) => savedEpisodeIds.includes(episodeId),
    [savedEpisodeIds]
  );

  return (
    <AudioPlayerContext.Provider
      value={{
        currentEpisode,
        isPlaying,
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
