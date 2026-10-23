"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  Heart,
  Share2,
  Send,
  BookOpen,
  Image as ImageIcon,
  Radio,
  Sparkles,
  Flame,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { COMMUNITY_POSTS, EPISODES } from "@/data/mockData";
import { CommunityPost } from "@/types";
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
  const [filterMode, setFilterMode] = useState<"Latest" | "Trending" | "Following">(
    "Latest"
  );
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    if (!currentUser) {
      openAuthModal({
        title: "Join Community Discussions",
        description: "Sign in or create an account to share reflections, ask questions, and encourage other believers.",
        pendingAction: {
          type: "post_comment",
          content: newPostContent.trim(),
          category: activeCategory,
        },
      });
      return;
    }

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: {
        id: currentUser.id,
        name: currentUser.displayName,
        username: currentUser.username,
        avatarUrl: currentUser.avatarUrl,
      },
      category: activeCategory,
      content: newPostContent.trim(),
      likesCount: 1,
      repliesCount: 0,
      isLiked: true,
      createdAt: "Just now",
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  const handleToggleLike = (postId: string) => {
    if (!currentUser) {
      openAuthModal({
        title: "React to Discussion",
        description: "Create an account or sign in to support testimonies and stand in prayer with fellow believers.",
        pendingAction: {
          type: "like_post",
          postId,
        },
      });
      return;
    }

    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: nextLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  const filteredPosts = posts.filter((p) => p.category === activeCategory);

  return (
    <div className="px-4 md:px-8 py-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Community
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1">
          Real people. Real conversations. A community built on faith.
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
              src={currentUser?.avatarUrl || "/images/gospel-forge-emblem.jpg"}
              alt={currentUser?.displayName || "Guest"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <textarea
              rows={3}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your thoughts, ask a question, or encourage someone..."
              className="w-full bg-[#181719] text-sm text-[#f5f0ea] placeholder-[#6e6f77] p-3 rounded-xl border border-[#262527] focus:border-[#ff4500] focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-[#a5a6af]">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181719] border border-[#262527] hover:border-[#ff4500]/40 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#ffb13b]" />
              <span>Scripture</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181719] border border-[#262527] hover:border-[#ff4500]/40 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-[#ff4500]" />
              <span>Episode</span>
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
        {(["Latest", "Trending", "Following"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterMode(filter)}
            className={cn(
              "transition-colors",
              filterMode === filter
                ? "text-[#ff4500] font-bold"
                : "hover:text-white"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
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
                  <h4 className="text-sm font-bold text-white">
                    {post.author.name}
                  </h4>
                  <p className="text-[11px] text-[#6e6f77] font-mono">
                    @{post.author.username} • {post.createdAt}
                  </p>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <p className="text-sm text-[#f5f0ea] font-body leading-relaxed">
              {post.content}
            </p>

            {/* Scripture Attachment */}
            {post.scriptureCitation && (
              <div className="p-3 rounded-xl bg-[#ff4500]/10 border border-[#ff4500]/30 text-xs font-cinzel text-[#ffb13b]">
                {post.scriptureCitation}
              </div>
            )}

            {/* Attached Episode Pill */}
            {post.attachedEpisodeTitle && (
              <Link
                href={`/episodes/${EPISODES[0].slug}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#181719] border border-[#262527] text-xs text-[#ffb13b] hover:border-[#ff4500]/50 transition-colors"
              >
                <Radio className="w-4 h-4 text-[#ff4500]" />
                <span className="font-semibold">
                  Attached: {post.attachedEpisodeTitle}
                </span>
              </Link>
            )}

            {/* Bottom Reactions */}
            <div className="flex items-center gap-6 pt-3 border-t border-[#1e1d1f] text-xs font-mono text-[#a5a6af]">
              <button
                onClick={() => handleToggleLike(post.id)}
                className={cn(
                  "flex items-center gap-1.5 transition-colors",
                  post.isLiked
                    ? "text-[#ff4500]"
                    : "text-[#a5a6af] hover:text-white"
                )}
              >
                <Heart
                  className={cn("w-4 h-4", post.isLiked && "fill-[#ff4500]")}
                />
                <span>{post.likesCount}</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>{post.repliesCount} replies</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
