"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  Episode,
  Series,
  Speaker,
  AuditLog,
  ModerationReport,
  PublicationStatus,
} from "@/types";
import { useAuth } from "./AuthContext";

interface PodcastStoreContextType {
  episodes: Episode[];
  seriesList: Series[];
  speakers: Speaker[];
  auditLogs: AuditLog[];
  moderationReports: ModerationReport[];
  isLoading: boolean;
  createEpisode: (
    data: Omit<Episode, "id" | "playCount" | "likesCount" | "createdAt" | "updatedAt">
  ) => Promise<{ success: boolean; episode?: Episode; error?: string }>;
  updateEpisode: (
    id: string,
    updates: Partial<Episode>
  ) => Promise<{ success: boolean; error?: string }>;
  publishEpisode: (
    id: string
  ) => Promise<{ success: boolean; error?: string }>;
  scheduleEpisode: (
    id: string,
    publishAtUtc: string
  ) => Promise<{ success: boolean; error?: string }>;
  archiveEpisode: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteEpisode: (id: string) => Promise<{ success: boolean; error?: string }>;
  resolveReport: (
    id: string,
    action: "resolved" | "dismissed"
  ) => Promise<{ success: boolean; error?: string }>;
  getEpisodeBySlug: (slug: string) => Episode | undefined;
  getPublishedEpisodes: () => Episode[];
  refreshData: () => Promise<void>;
}

const PodcastStoreContext = createContext<PodcastStoreContextType | undefined>(
  undefined
);

export function PodcastStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, canPublish } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [moderationReports, setModerationReports] = useState<ModerationReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      const [epRes, sRes, spRes] = await Promise.all([
        fetch("/api/episodes").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/series").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/speakers").then((r) => (r.ok ? r.json() : null)),
      ]);

      if (epRes?.episodes && Array.isArray(epRes.episodes)) {
        setEpisodes(epRes.episodes);
      }
      if (sRes?.series && Array.isArray(sRes.series)) {
        setSeriesList(sRes.series);
      }
      if (spRes?.speakers && Array.isArray(spRes.speakers)) {
        setSpeakers(spRes.speakers);
      }
    } catch (err) {
      console.warn("Failed to refresh podcast data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial data from APIs
  useEffect(() => {
    refreshData();

    // Check stored audit logs for offline audit trails
    try {
      const storedLogs = localStorage.getItem("gospel_audit_logs");
      if (storedLogs) {
        setAuditLogs(JSON.parse(storedLogs));
      }
    } catch {}
  }, [refreshData]);

  const saveEpisodes = (updated: Episode[]) => {
    setEpisodes(updated);
    try {
      localStorage.setItem("gospel_episodes_store", JSON.stringify(updated));
    } catch {}
  };

  const addAuditLog = useCallback(
    (action: string, targetType: AuditLog["targetType"], targetId: string, targetTitle?: string, metadata?: any) => {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        userId: currentUser?.id || "usr-system",
        userName: currentUser?.displayName || "System",
        userRole: currentUser?.role || "listener",
        action,
        targetType,
        targetId,
        targetTitle,
        metadata,
        createdAt: new Date().toISOString(),
      };
      setAuditLogs((prev) => {
        const next = [newLog, ...prev];
        try {
          localStorage.setItem("gospel_audit_logs", JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [currentUser]
  );

  const createEpisode = useCallback(
    async (
      data: Omit<Episode, "id" | "playCount" | "likesCount" | "createdAt" | "updatedAt">
    ): Promise<{ success: boolean; episode?: Episode; error?: string }> => {
      if (!currentUser || !["editor", "admin", "super_admin"].includes(currentUser.role)) {
        return {
          success: false,
          error: "Permission denied: Only creators, editors and admins can create episodes.",
        };
      }

      if (data.status === "published" && !canPublish) {
        return {
          success: false,
          error: "Permission denied: Publishing requires Administrator rights.",
        };
      }

      const newId = `ep-${Date.now()}`;
      const newEpisode: Episode = {
        ...data,
        id: newId,
        playCount: 0,
        likesCount: 0,
        authorId: currentUser.id,
        authorName: currentUser.displayName,
        lastEditedById: currentUser.id,
        lastEditedByName: currentUser.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [newEpisode, ...episodes];
      saveEpisodes(updated);

      addAuditLog(
        newEpisode.status === "published" ? "PUBLISH_EPISODE" : "CREATE_DRAFT",
        "episode",
        newId,
        newEpisode.title
      );

      return { success: true, episode: newEpisode };
    },
    [currentUser, episodes, canPublish, addAuditLog]
  );

  const updateEpisode = useCallback(
    async (
      id: string,
      updates: Partial<Episode>
    ): Promise<{ success: boolean; error?: string }> => {
      const existing = episodes.find((e) => e.id === id);
      if (!existing) {
        return { success: false, error: "Episode not found." };
      }

      if (
        updates.status === "published" &&
        existing.status !== "published" &&
        !canPublish
      ) {
        return {
          success: false,
          error: "Permission denied: Publishing requires Administrator approval.",
        };
      }

      const updatedList = episodes.map((e) =>
        e.id === id
          ? {
              ...e,
              ...updates,
              lastEditedById: currentUser?.id || e.lastEditedById,
              lastEditedByName: currentUser?.displayName || e.lastEditedByName,
              updatedAt: new Date().toISOString(),
            }
          : e
      );

      saveEpisodes(updatedList);
      addAuditLog("UPDATE_EPISODE", "episode", id, existing.title, updates);

      return { success: true };
    },
    [currentUser, episodes, canPublish, addAuditLog]
  );

  const publishEpisode = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (!canPublish) {
        return {
          success: false,
          error: "Permission denied: Only administrators can approve and publish episodes.",
        };
      }

      const target = episodes.find((e) => e.id === id);
      if (!target) {
        return { success: false, error: "Episode not found." };
      }

      try {
        await fetch("/api/episodes/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ episodeId: id }),
        });
      } catch (err) {
        console.warn("Server publish call warning:", err);
      }

      const updatedList = episodes.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "published" as PublicationStatus,
              publishedAt: new Date().toISOString(),
            }
          : e
      );
      saveEpisodes(updatedList);

      addAuditLog("PUBLISH_EPISODE", "episode", id, target.title);

      return { success: true };
    },
    [canPublish, episodes, addAuditLog]
  );

  const scheduleEpisode = useCallback(
    async (
      id: string,
      publishAtUtc: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!canPublish) {
        return {
          success: false,
          error: "Permission denied: Scheduling requires Administrator approval.",
        };
      }

      const target = episodes.find((e) => e.id === id);
      if (!target) {
        return { success: false, error: "Episode not found." };
      }

      const updatedList = episodes.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "scheduled" as PublicationStatus,
              scheduledPublishAt: publishAtUtc,
            }
          : e
      );
      saveEpisodes(updatedList);

      addAuditLog("SCHEDULE_EPISODE", "episode", id, target.title, {
        publishAtUtc,
      });

      return { success: true };
    },
    [canPublish, episodes, addAuditLog]
  );

  const archiveEpisode = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (!canPublish) {
        return {
          success: false,
          error: "Permission denied: Archiving requires Administrator privileges.",
        };
      }

      const target = episodes.find((e) => e.id === id);
      if (!target) {
        return { success: false, error: "Episode not found." };
      }

      const updatedList = episodes.map((e) =>
        e.id === id ? { ...e, status: "archived" as PublicationStatus } : e
      );
      saveEpisodes(updatedList);

      addAuditLog("ARCHIVE_EPISODE", "episode", id, target.title);

      return { success: true };
    },
    [canPublish, episodes, addAuditLog]
  );

  const deleteEpisode = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser || currentUser.role !== "super_admin") {
        return {
          success: false,
          error: "Permission denied: Permanent deletion requires Super Admin role.",
        };
      }

      const target = episodes.find((e) => e.id === id);
      const updatedList = episodes.filter((e) => e.id !== id);
      saveEpisodes(updatedList);

      addAuditLog("DELETE_EPISODE", "episode", id, target?.title);

      return { success: true };
    },
    [currentUser, episodes, addAuditLog]
  );

  const resolveReport = useCallback(
    async (id: string, action: "resolved" | "dismissed") => {
      setModerationReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: action } : r))
      );
      return { success: true };
    },
    []
  );

  const getEpisodeBySlug = useCallback(
    (slug: string) => episodes.find((e) => e.slug === slug),
    [episodes]
  );

  const getPublishedEpisodes = useCallback(() => {
    return episodes.filter((e) => e.status === "published" || !e.status);
  }, [episodes]);

  return (
    <PodcastStoreContext.Provider
      value={{
        episodes,
        seriesList,
        speakers,
        auditLogs,
        moderationReports,
        isLoading,
        createEpisode,
        updateEpisode,
        publishEpisode,
        scheduleEpisode,
        archiveEpisode,
        deleteEpisode,
        resolveReport,
        getEpisodeBySlug,
        getPublishedEpisodes,
        refreshData,
      }}
    >
      {children}
    </PodcastStoreContext.Provider>
  );
}

export function usePodcastStore() {
  const context = useContext(PodcastStoreContext);
  if (!context) {
    throw new Error("usePodcastStore must be used within a PodcastStoreProvider");
  }
  return context;
}
