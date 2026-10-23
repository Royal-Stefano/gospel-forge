"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Save,
  Radio,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAuth } from "@/context/AuthContext";
import type { PublicationStatus } from "@/types";

export default function EditEpisodePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { episodes, seriesList, speakers, updateEpisode } = usePodcastStore();
  const { canPublish } = useAuth();

  const episode = episodes.find((e) => e.id === id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showNotes, setShowNotes] = useState("");
  const [scriptureReferences, setScriptureReferences] = useState("");
  const [topics, setTopics] = useState("");
  const [status, setStatus] = useState<PublicationStatus>("draft");
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (episode) {
      setTitle(episode.title);
      setDescription(episode.description);
      setShowNotes(episode.showNotes || "");
      setScriptureReferences(episode.scriptureReferences?.join(", ") || "");
      setTopics(episode.topics?.join(", ") || "");
      setStatus((episode.status || "published") as PublicationStatus);
      setSelectedSeriesId(episode.seriesId);
      setSelectedSpeakerId(episode.speaker?.id || speakers[0]?.id || "");
    }
  }, [episode, speakers]);

  if (!episode) {
    return (
      <div className="p-8 text-center text-white">
        <p>Episode not found.</p>
        <Link href="/studio/episodes" className="text-[#ff4500] hover:underline mt-2 inline-block">
          ← Back to Episodes
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const series = seriesList.find((s) => s.id === selectedSeriesId) || seriesList[0];
    const speaker = speakers.find((s) => s.id === selectedSpeakerId) || speakers[0];

    const res = await updateEpisode(episode.id, {
      title: title.trim(),
      description: description.trim(),
      showNotes: showNotes.trim(),
      scriptureReferences: scriptureReferences
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      topics: topics.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      seriesId: series.id,
      seriesTitle: series.title,
      speaker,
    });

    if (res.success) {
      setFeedback("Episode metadata saved successfully.");
    } else {
      alert(res.error || "Failed to update episode.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/studio/episodes"
            className="p-2 rounded-lg bg-[#181719] text-[#a5a6af] hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Edit Episode
            </h1>
            <p className="text-xs text-[#a5a6af]">
              Modify details, scripture anchors, and release status.
            </p>
          </div>
        </div>

        {episode.status === "published" && (
          <Link
            href={`/episodes/${episode.slug}`}
            target="_blank"
            className="text-xs font-mono text-[#ffb13b] hover:underline"
          >
            View Live Episode ↗
          </Link>
        )}
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 md:p-8 rounded-3xl bg-[#111113] border border-[#222123] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-mono text-[#a5a6af] uppercase">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#161517] text-sm text-white px-4 py-2.5 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#a5a6af] uppercase">Series</label>
            <select
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              className="w-full bg-[#161517] text-sm text-white px-4 py-2.5 rounded-xl border border-[#262527]"
            >
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#a5a6af] uppercase">Speaker</label>
            <select
              value={selectedSpeakerId}
              onChange={(e) => setSelectedSpeakerId(e.target.value)}
              className="w-full bg-[#161517] text-sm text-white px-4 py-2.5 rounded-xl border border-[#262527]"
            >
              {speakers.map((spk) => (
                <option key={spk.id} value={spk.id}>
                  {spk.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#a5a6af] uppercase">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PublicationStatus)}
              className="w-full bg-[#161517] text-sm text-white px-4 py-2.5 rounded-xl border border-[#262527]"
            >
              <option value="draft">Draft</option>
              <option value="published" disabled={!canPublish}>
                Published {!canPublish ? "(Admin required)" : ""}
              </option>
              <option value="scheduled" disabled={!canPublish}>
                Scheduled {!canPublish ? "(Admin required)" : ""}
              </option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-mono text-[#a5a6af] uppercase">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161517] text-sm text-white p-3 rounded-xl border border-[#262527] focus:outline-none"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-mono text-[#a5a6af] uppercase">
              Scripture References
            </label>
            <input
              type="text"
              value={scriptureReferences}
              onChange={(e) => setScriptureReferences(e.target.value)}
              className="w-full bg-[#161517] text-sm text-white px-4 py-2.5 rounded-xl border border-[#262527]"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-mono text-[#a5a6af] uppercase">Show Notes</label>
            <textarea
              rows={4}
              value={showNotes}
              onChange={(e) => setShowNotes(e.target.value)}
              className="w-full bg-[#161517] text-sm text-white p-3 rounded-xl border border-[#262527] font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#1f1e20]">
          <Link
            href="/studio/episodes"
            className="px-5 py-2.5 rounded-full bg-[#181719] text-xs font-semibold text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#ff4500] to-[#ffb13b] text-black font-heading font-bold text-xs uppercase tracking-wider"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
