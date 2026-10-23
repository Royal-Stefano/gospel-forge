"use client";

import React, { useState } from "react";
import { MessageSquare, ShieldAlert, CheckCircle, Ban, EyeOff, Check, X } from "lucide-react";
import { usePodcastStore } from "@/context/PodcastStoreContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";

export default function StudioCommunityModerationPage() {
  const { moderationReports, resolveReport } = usePodcastStore();
  const { toggleUserSuspension } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = async (reportId: string, action: "resolved" | "dismissed", authorId?: string, suspend?: boolean) => {
    if (suspend && authorId) {
      await toggleUserSuspension(authorId);
    }
    await resolveReport(reportId, action);
    setFeedback(`Report marked as ${action}.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Community Moderation
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1 font-body">
          Review flagged discussions, remove inappropriate content, and enforce fellowship standards.
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      <div className="space-y-4">
        {moderationReports.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#111113] border border-[#222123] text-[#6e6f77]">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-white font-medium">Moderation Queue Clear</p>
            <p className="text-xs mt-1">No pending reports at this time.</p>
          </div>
        ) : (
          moderationReports.map((report) => (
            <div
              key={report.id}
              className="p-6 rounded-2xl bg-[#111113] border border-[#222123] hover:border-[#ff4500]/30 transition-all space-y-4"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#ff4500] font-bold uppercase">
                  Flagged {report.targetType}: {report.reason}
                </span>
                <span className="text-[#6e6f77]">{formatDate(report.reportedAt)}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#161517] border border-[#262527] space-y-1">
                <p className="text-xs text-[#a5a6af] font-mono">
                  Posted by <strong className="text-white">{report.authorName}</strong> (Reported by {report.reportedBy}):
                </p>
                <p className="text-sm text-white font-body italic">
                  &ldquo;{report.content}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono uppercase text-[#a5a6af]">
                  Status: <strong className={report.status === "pending" ? "text-amber-400" : "text-emerald-400"}>{report.status}</strong>
                </span>

                {report.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(report.id, "dismissed")}
                      className="px-3 py-1.5 rounded-lg bg-[#181719] hover:bg-[#201f22] text-[#a5a6af] hover:text-white text-xs font-mono border border-[#2a2929]"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleAction(report.id, "resolved")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-mono"
                    >
                      Hide & Resolve
                    </button>
                    <button
                      onClick={() => handleAction(report.id, "resolved", report.authorId, true)}
                      className="px-3 py-1.5 rounded-lg bg-red-950/80 text-red-300 hover:bg-red-900 border border-red-500/40 text-xs font-mono"
                    >
                      Suspend User
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
