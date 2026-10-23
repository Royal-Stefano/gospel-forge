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
import { EPISODES as INITIAL_EPISODES, SERIES_LIST, SPEAKERS } from "@/data/mockData";
import { useAuth } from "./AuthContext";

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    userId: "usr-admin",
    userName: "Dr. Sarah Jenkins",
    userRole: "admin",
    action: "PUBLISH_EPISODE",
    targetType: "episode",
    targetId: "ep-1",
    targetTitle: "Purpose in the Process",
    createdAt: "2024-10-12T08:00:00Z",
  },
  {
    id: "log-2",
    userId: "usr-editor",
    userName: "Ethan Cross",
    userRole: "editor",
    action: "CREATE_DRAFT",
    targetType: "episode",
    targetId: "ep-draft-sample",
    targetTitle: "Forged in the Wilderness (Draft)",
    createdAt: "2024-10-22T14:30:00Z",
  },
];

const INITIAL_REPORTS: ModerationReport[] = [
  {
    id: "rep-1",
    targetType: "post",
    targetId: "post-sample",
    content: "Potential self-promotion link posted in prayer discussion.",
    authorName: "Anonymous Visitor",
    authorId: "usr-anon",
    reportedBy: "Sarah K.",
    reason: "Off-topic solicitation",
    status: "pending",
    reportedAt: "2024-10-23T11:20:00Z",
  },
];

interface PodcastStoreContextType {
  episodes: Episode[];
  seriesList: Series[];
  speakers: Speaker[];
  auditLogs: AuditLog[];
  moderationReports: ModerationReport[];
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
  const [episodes, setEpisodes] = useState<Episode[]>(() => {
    // Tag initial episodes as 'published'
    return INITIAL_EPISODES.map((e) => ({
      ...e,
      status: (e.status || "published") as PublicationStatus,
    }));
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [moderationReports, setModerationReports] =
    useState<ModerationReport[]>(INITIAL_REPORTS);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const storedEpisodes = localStorage.getItem("gospel_episodes_store");
      if (storedEpisodes) {
        setEpisodes(JSON.parse(storedEpisodes));
      } else {
        localStorage.setItem(
          "gospel_episodes_store",
          JSON.stringify(
            INITIAL_EPISODES.map((e) => ({
              ...e,
              status: "published" as PublicationStatus,
            }))
          )
        );
      }

      const storedLogs = localStorage.getItem("gospel_audit_logs");
      if (storedLogs) {
        setAuditLogs(JSON.parse(storedLogs));
      }
    } catch {}
  }, []);

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
          error: "Permission denied: Only editors and admins can create episodes.",
        };
      }

      // Editors cannot directly publish
      if (data.status === "published" && !canPublish) {
        return {
          success: false,
          error: "Permission denied: Editors can only create drafts or submit for review. Publishing requires Admin rights.",
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
      if (!currentUser || !["editor", "admin", "super_admin"].includes(currentUser.role)) {
        return { success: false, error: "Permission denied: Studio rights required." };
      }

      // Check if trying to publish without rights
      if (updates.status === "published" && !canPublish) {
        return {
          success: false,
          error: "Permission denied: Publishing requires Admin or Super Admin rights.",
        };
      }

      const existing = episodes.find((e) => e.id === id);
      if (!existing) return { success: false, error: "Episode not found." };

      const updatedEpisode: Episode = {
        ...existing,
        ...updates,
        lastEditedById: currentUser.id,
        lastEditedByName: currentUser.displayName,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = episodes.map((e) => (e.id === id ? updatedEpisode : e));
      saveEpisodes(updatedList);

      addAuditLog("UPDATE_EPISODE", "episode", id, updatedEpisode.title);

      return { success: true };
    },
    [currentUser, episodes, canPublish, addAuditLog]
  );

  const publishEpisode = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser || !canPublish) {
        return {
          success: false,
          error: "Permission denied: Publishing requires Admin or Super Admin role.",
        };
      }

      const target = episodes.find((e) => e.id === id);
      if (!target) return { success: false, error: "Episode not found." };

      if (!target.audioUrl) {
        return { success: false, error: "Cannot publish: No playable audio source attached." };
      }

      try {
        await fetch("/api/episodes/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ episodeId: id, toStatus: "published" }),
        });
      } catch (err) {
        console.warn("Server publishing call warning:", err);
      }

      const updatedEpisode: Episode = {
        ...target,
        status: "published",
        publishedAt: new Date().toISOString(),
        lastEditedById: currentUser.id,
        lastEditedByName: currentUser.displayName,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = episodes.map((e) => (e.id === id ? updatedEpisode : e));
      saveEpisodes(updatedList);

      addAuditLog("PUBLISH_EPISODE", "episode", id, target.title);

      return { success: true };
    },
    [currentUser, episodes, canPublish, addAuditLog]
  );

  const scheduleEpisode = useCallback(
    async (
      id: string,
      publishAtUtc: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser || !canPublish) {
        return {
          success: false,
          error: "Permission denied: Scheduling publication requires Admin rights.",
        };
      }

      const target = episodes.find((e) => e.id === id);
      if (!target) return { success: false, error: "Episode not found." };

      const updatedEpisode: Episode = {
        ...target,
        status: "scheduled",
        scheduledPublishAt: publishAtUtc,
        lastEditedById: currentUser.id,
        lastEditedByName: currentUser.displayName,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = episodes.map((e) => (e.id === id ? updatedEpisode : e));
      saveEpisodes(updatedList);

      addAuditLog("SCHEDULE_EPISODE", "episode", id, target.title, { publishAtUtc });

      return { success: true };
    },
    [currentUser, episodes, canPublish, addAuditLog]
  );

  const archiveEpisode = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser || !canPublish) {
        return { success: false, error: "Permission denied: Admin rights required." };
      }

      const target = episodes.find((e) => e.id === id);
      if (!target) return { success: false, error: "Episode not found." };

      try {
        await fetch("/api/episodes/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ episodeId: id, toStatus: "archived" }),
        });
      } catch (err) {
        console.warn("Server archive call warning:", err);
      }

      const updatedList = episodes.map((e) =>
        e.id === id ? { ...e, status: "archived" as PublicationStatus } : e
      );
      saveEpisodes(updatedList);

      addAuditLog("ARCHIVE_EPISODE", "episode", id, target.title);

      return { success: true };
    },
    [currentUser, episodes, canPublish, addAuditLog]
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
        seriesList: SERIES_LIST,
        speakers: SPEAKERS,
        auditLogs,
        moderationReports,
        createEpisode,
        updateEpisode,
        publishEpisode,
        scheduleEpisode,
        archiveEpisode,
        deleteEpisode,
        resolveReport,
        getEpisodeBySlug,
        getPublishedEpisodes,
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
