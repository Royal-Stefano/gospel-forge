"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  Heart,
  Share2,
  Send,
  BookOpen,
  Radio,
  Flame,
  Flag,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const COMMUNITY_CATEGORIES = [
  "Discussions",
  "Prayer Requests",
  "Testimonies",
  "Events",
] as const;

export default function CommunityPage() {
  const { currentUser, openAuthModal } = useAuth();
  const [activeCategory, setActiveCategory] =
    useState<(typeof COMMUNITY_CATEGORIES)[number]>("Discussions");
  const [filterMode, setFilterMode] = useState<"Latest" | "Trending">("Latest");
  const [newPostContent, setNewPostContent] = useState("");
  const [scriptureInput, setScriptureInput] = useState("");
  const [showScriptureField, setShowScriptureField] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [commentInput, setCommentInput] = useState("");
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/community?category=${encodeURIComponent(activeCategory)}&sort=${filterMode}`
      );
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, filterMode]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    if (!currentUser) {
      openAuthModal({
        title: "Join Community Discussions",
        description:
          "Sign in or create an account to share reflections, ask questions, and stand in prayer with other believers.",
      });
      return;
    }

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeCategory,
          content: newPostContent.trim(),
          scriptureCitation: scriptureInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data?.success && data?.post) {
        setPosts([data.post, ...posts]);
        setNewPostContent("");
        setScriptureInput("");
        setShowScriptureField(false);
      }
    } catch {}
  };

  const handleToggleLike = async (postId: string) => {
    if (!currentUser) {
      openAuthModal({
        title: "React to Discussion",
        description:
          "Create an account or sign in to support testimonies and stand in prayer with fellow believers.",
      });
      return;
    }

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/community/${postId}/like`, { method: "POST" });
    } catch {}
  };

  const toggleComments = async (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }

    setActiveCommentPostId(postId);

    if (!commentsMap[postId]) {
      try {
        const res = await fetch(`/api/community/${postId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setCommentsMap((prev) => ({ ...prev, [postId]: data.comments || [] }));
        }
      } catch {}
    }
  };

  const handlePostComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!currentUser) {
      openAuthModal({
        title: "Comment on Discussion",
        description: "Sign in to reply and encourage your brothers and sisters in Christ.",
      });
      return;
    }

    try {
      const res = await fetch(`/api/community/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentInput.trim() }),
      });
      const data = await res.json();
      if (data?.success && data?.comment) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment],
        }));
        setCommentInput("");
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, repliesCount: (p.repliesCount || 0) + 1 } : p
          )
        );
      }
    } catch {}
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId || !reportReason.trim()) return;

    try {
      await fetch(`/api/community/${reportingPostId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setReportingPostId(null);
        setReportReason("");
        setReportSubmitted(false);
      }, 1800);
    } catch {}
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Community
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1">
          Real people. Genuine faith. Fellowship and encouragement forged in truth.
        </p>
      </div>

      {/* Category Tabs: Discussions, Prayer Requests, Testimonies, Events */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {COMMUNITY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-heading font-medium tracking-wide transition-all whitespace-nowrap",
              activeCategory === cat
                ? "bg-[#8f1609] text-white font-bold shadow-[0_0_15px_rgba(143,22,9,0.5)] border border-[#ff4500]/50"
                : "bg-[#161517] text-[#a5a6af] hover:text-white hover:bg-[#201f22] border border-[#262527]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post Creator Box */}
      <form
        onSubmit={handleCreatePost}
        className="p-5 rounded-2xl bg-[#121113] border border-[#262527] shadow-xl space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#2a2929]">
            <Image
              src={
                currentUser?.avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
              }
              alt={currentUser?.displayName || "Guest"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={
                activeCategory === "Prayer Requests"
                  ? "Share a prayer need with the body of Christ..."
                  : activeCategory === "Testimonies"
                  ? "Share what the Lord has done in your life..."
                  : "Share your reflections, ask a theological question, or encourage someone..."
              }
              className="w-full bg-[#181719] text-sm text-[#f5f0ea] placeholder-[#6e6f77] p-3 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none resize-none"
            />

            {showScriptureField && (
              <input
                type="text"
                value={scriptureInput}
                onChange={(e) => setScriptureInput(e.target.value)}
                placeholder="Scripture reference (e.g. Romans 8:28, Isaiah 43:2)..."
                className="w-full bg-[#181719] text-xs text-[#ffb13b] placeholder-[#6e6f77] p-2.5 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none"
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-[#a5a6af]">
            <button
              type="button"
              onClick={() => setShowScriptureField(!showScriptureField)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors",
                showScriptureField
                  ? "bg-[#ff4500]/20 border-[#ff4500] text-[#ffb13b]"
                  : "bg-[#181719] border-[#262527] text-[#a5a6af] hover:border-[#ff4500]/40"
              )}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#ffb13b]" />
              <span>{showScriptureField ? "Hide Scripture" : "Add Scripture"}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!newPostContent.trim()}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-[#8f1609] to-[#ff4500] text-white font-heading font-bold text-xs uppercase tracking-wider disabled:opacity-50 hover:shadow-[0_0_15px_rgba(255,69,0,0.5)] transition-all"
          >
            Post
          </button>
        </div>
      </form>

      {/* Feed Filters */}
      <div className="flex items-center gap-4 text-xs font-mono text-[#a5a6af] border-b border-[#222123] pb-3">
        {(["Latest", "Trending"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterMode(filter)}
            className={cn(
              "transition-colors",
              filterMode === filter ? "text-[#ff4500] font-bold" : "hover:text-white"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-[#a5a6af] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#ff4500]" />
            <span>Loading community conversations...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#121113]/80 border border-[#222125] text-center space-y-3">
            <Flame className="w-8 h-8 text-[#ffb13b] mx-auto opacity-70" />
            <h3 className="font-heading text-sm font-semibold text-white">
              No {activeCategory.toLowerCase()} posted yet
            </h3>
            <p className="text-xs text-[#a5a6af] max-w-sm mx-auto">
              Be the first to share an encouragement, reflection, or prayer request with the Gospel Forge fellowship.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl bg-[#121113] border border-[#222123] hover:border-[#ff4500]/30 transition-all space-y-3"
            >
              {/* Author row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#2a2929]">
                    <Image
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{post.author.name}</h4>
                    <p className="text-[11px] text-[#6e6f77] font-mono">
                      @{post.author.username} •{" "}
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReportingPostId(post.id)}
                  className="p-1.5 text-[#6e6f77] hover:text-red-400 rounded-lg hover:bg-[#1c1b1f] transition-colors"
                  title="Report content"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-sm text-[#f5f0ea] font-body leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Scripture Attachment */}
              {post.scriptureCitation && (
                <div className="p-3 rounded-xl bg-[#ff4500]/10 border border-[#ff4500]/30 text-xs font-cinzel text-[#ffb13b]">
                  {post.scriptureCitation}
                </div>
              )}

              {/* Bottom Reactions */}
              <div className="flex items-center gap-6 pt-3 border-t border-[#1e1d1f] text-xs font-mono text-[#a5a6af]">
                <button
                  onClick={() => handleToggleLike(post.id)}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors",
                    post.isLiked ? "text-[#ff4500]" : "text-[#a5a6af] hover:text-white"
                  )}
                >
                  <Heart className={cn("w-4 h-4", post.isLiked && "fill-[#ff4500]")} />
                  <span>{post.likesCount}</span>
                </button>

                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.repliesCount} replies</span>
                </button>
              </div>

              {/* Comments Section */}
              {activeCommentPostId === post.id && (
                <div className="pt-3 border-t border-[#1e1d21] space-y-3">
                  <div className="space-y-2">
                    {(commentsMap[post.id] || []).map((c: any) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-[#18171b] border border-[#222125] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#a5a6af]">
                          <span className="font-bold text-white">{c.author.name}</span>
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[#e2e1e6]">{c.content}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => handlePostComment(e, post.id)}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Write an encouraging reply..."
                      className="flex-1 bg-[#181719] border border-[#262527] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#6e6f77] focus:border-[#ff4500] outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-[#ff4500] text-black font-heading font-bold text-xs hover:bg-[#e63900] disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* REPORT MODAL */}
      {reportingPostId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141316] border border-[#2a292f] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500" />
              Report Community Content
            </h3>
            {reportSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-xs text-emerald-400">
                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
                Report submitted for administrator review.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3">
                <textarea
                  rows={3}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Reason for report (e.g. inappropriate content, spam, unbiblical conduct)..."
                  className="w-full bg-[#1b1a1f] border border-[#2d2c33] rounded-xl p-3 text-xs text-white placeholder-[#6e6f77] outline-none focus:border-red-500 resize-none"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportingPostId(null)}
                    className="px-4 py-2 text-xs text-[#a5a6af] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReason.trim()}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-heading font-bold text-xs disabled:opacity-50"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
