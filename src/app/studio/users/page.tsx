"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Ban,
  CheckCircle,
  AlertTriangle,
  Clock,
  Mic,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";
import { formatDate, cn } from "@/lib/utils";

export default function StudioUsersManager() {
  const {
    currentUser,
    usersList,
    artistApplications,
    updateUserRole,
    approveArtist,
    rejectArtist,
    toggleUserSuspension,
    canManageRoles,
    canManageUsers,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"users" | "artists">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRoleSelect, setNewRoleSelect] = useState<UserRole>("listener");
  const [feedback, setFeedback] = useState<string | null>(null);

  const pendingArtistsCount = artistApplications.filter((a) => a.status === "pending").length;

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesRole =
        selectedRoleFilter === "all" || u.role === selectedRoleFilter;
      const matchesQuery =
        searchQuery === "" ||
        u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRole && matchesQuery;
    });
  }, [usersList, selectedRoleFilter, searchQuery]);

  const handleRoleChangeSubmit = async (userId: string) => {
    const res = await updateUserRole(userId, newRoleSelect);
    if (res.success) {
      setFeedback("User role updated successfully.");
      setEditingUser(null);
    } else {
      alert(res.error || "Failed to update role.");
    }
  };

  const handleSuspensionToggle = async (userId: string) => {
    const res = await toggleUserSuspension(userId);
    if (res.success) {
      setFeedback("Account status updated.");
    } else {
      alert(res.error || "Failed to toggle suspension.");
    }
  };

  const handleApproveArtist = async (appId: string, name: string) => {
    const res = await approveArtist(appId);
    if (res.success) {
      setFeedback(`Artist application for ${name} approved! Granted Studio creator access.`);
    }
  };

  const handleRejectArtist = async (appId: string) => {
    const res = await rejectArtist(appId);
    if (res.success) {
      setFeedback("Artist application rejected.");
    }
  };

  const roleBadgeColors: Record<UserRole, string> = {
    super_admin: "bg-red-950/80 text-red-300 border-red-500/40",
    admin: "bg-[#ff4500]/15 text-[#ffb13b] border-[#ff4500]/40",
    editor: "bg-blue-950/80 text-blue-300 border-blue-500/40",
    listener: "bg-gray-900 text-gray-300 border-gray-700",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          User & Creator Administration
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1 font-body">
          Manage accounts, approve artist applications, assign roles, and enforce suspensions.
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

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#222123] pb-3 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "pb-2 relative transition-colors",
            activeTab === "users" ? "text-[#ff4500]" : "text-[#a5a6af] hover:text-white"
          )}
        >
          <span>Platform Accounts ({usersList.length})</span>
          {activeTab === "users" && (
            <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#ff4500]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("artists")}
          className={cn(
            "pb-2 relative transition-colors flex items-center gap-2",
            activeTab === "artists" ? "text-[#ff4500]" : "text-[#a5a6af] hover:text-white"
          )}
        >
          <span>Artist Ingest Applications</span>
          {pendingArtistsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ff4500] text-black">
              {pendingArtistsCount} Pending
            </span>
          )}
          {activeTab === "artists" && (
            <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#ff4500]" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PLATFORM USERS */}
      {/* ========================================================= */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#111113] border border-[#222123] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {["all", "super_admin", "admin", "editor", "listener"].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRoleFilter(role)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-mono transition-colors capitalize",
                    selectedRoleFilter === role
                      ? "bg-[#ff4500] text-black font-bold"
                      : "bg-[#181719] text-[#a5a6af] hover:text-white border border-[#262527]"
                  )}
                >
                  {role.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 w-4 h-4 text-[#6e6f77]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, handle..."
                className="w-full bg-[#181719] text-xs text-white placeholder-[#6e6f77] pl-9 pr-3 py-2 rounded-xl border border-[#262527] focus:outline-none"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-[#222123] text-[#6e6f77] uppercase">
                  <tr>
                    <th className="pb-3">User & Email</th>
                    <th className="pb-3">Role & Artist Status</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Registered</th>
                    <th className="pb-3">Last Sign In</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181719]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#161517]/80">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#2a2929]">
                            <Image
                              src={u.avatarUrl}
                              alt={u.displayName}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">
                              {u.displayName}
                            </p>
                            <p className="text-[11px] text-[#a5a6af] truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3">
                        <div className="space-y-1">
                          {editingUser === u.id && canManageRoles ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={newRoleSelect}
                                onChange={(e) =>
                                  setNewRoleSelect(e.target.value as UserRole)
                                }
                                className="bg-[#1c1b1b] text-white p-1 rounded border border-[#2a2929] text-xs"
                              >
                                <option value="listener">listener</option>
                                <option value="editor">editor</option>
                                <option value="admin">admin</option>
                                <option value="super_admin">super_admin</option>
                              </select>
                              <button
                                onClick={() => handleRoleChangeSubmit(u.id)}
                                className="px-2 py-1 rounded bg-[#ff4500] text-black font-bold text-[10px]"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="text-[#6e6f77] hover:text-white text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                roleBadgeColors[u.role]
                              )}
                            >
                              {u.role.replace("_", " ")}
                            </span>
                          )}

                          {u.artistStatus && u.artistStatus !== "none" && (
                            <span
                              className={cn(
                                "block text-[9px] font-mono",
                                u.artistStatus === "approved"
                                  ? "text-emerald-400"
                                  : u.artistStatus === "pending"
                                  ? "text-blue-400"
                                  : "text-red-400"
                              )}
                            >
                              Artist: {u.artistStatus}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            u.status === "active"
                              ? "bg-emerald-950/80 text-emerald-400"
                              : "bg-red-950/80 text-red-400"
                          )}
                        >
                          {u.status}
                        </span>
                      </td>

                      <td className="py-3 text-[#6e6f77]">
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="py-3 text-[#a5a6af]">
                        {u.lastSignInAt ? formatDate(u.lastSignInAt) : "Never"}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManageRoles && editingUser !== u.id && (
                            <button
                              onClick={() => {
                                setEditingUser(u.id);
                                setNewRoleSelect(u.role);
                              }}
                              className="px-2.5 py-1 rounded-md bg-[#181719] hover:bg-[#222123] text-white border border-[#2a2929] text-[10px]"
                            >
                              Role
                            </button>
                          )}

                          {canManageUsers && u.role !== "super_admin" && (
                            <button
                              onClick={() => handleSuspensionToggle(u.id)}
                              className={cn(
                                "px-2.5 py-1 rounded-md text-[10px] border",
                                u.status === "active"
                                  ? "bg-[#181719] text-red-400 border-red-500/30 hover:bg-red-950/50"
                                  : "bg-[#181719] text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/50"
                              )}
                            >
                              {u.status === "active" ? "Suspend" : "Unsuspend"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ARTIST APPLICATIONS */}
      {/* ========================================================= */}
      {activeTab === "artists" && (
        <div className="space-y-4">
          {artistApplications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#111113] border border-[#222123] text-[#6e6f77]">
              <Mic className="w-8 h-8 text-[#ff4500] mx-auto mb-2" />
              <p className="text-white font-medium">No Artist Applications</p>
              <p className="text-xs mt-1">New applications will appear here for admin review.</p>
            </div>
          ) : (
            artistApplications.map((app) => (
              <div
                key={app.id}
                className="p-6 rounded-2xl bg-[#111113] border border-[#222123] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                    <h3 className="text-base font-bold text-white">
                      {app.ministryOrBandName}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border",
                      app.status === "approved"
                        ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                        : app.status === "pending"
                        ? "bg-blue-950/80 text-blue-300 border-blue-500/40"
                        : "bg-red-950/80 text-red-400 border-red-500/40"
                    )}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-[#a5a6af] p-3 rounded-xl bg-[#161517]">
                  <div>
                    <span className="text-[#6e6f77] block">Creator Name:</span>
                    <strong className="text-white">{app.userName}</strong> ({app.userEmail})
                  </div>
                  <div>
                    <span className="text-[#6e6f77] block">Submitted Date:</span>
                    <span>{formatDate(app.submittedAt)}</span>
                  </div>
                </div>

                <p className="text-xs text-[#a5a6af] font-body">{app.bio}</p>

                {app.sampleAudioLink && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-[#6e6f77]">Sample Material:</span>
                    <a
                      href={app.sampleAudioLink}
                      target="_blank"
                      className="text-[#ffb13b] hover:underline flex items-center gap-1"
                    >
                      <span>Listen to Sample Audio</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {app.status === "pending" && (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f1e20]">
                    <button
                      onClick={() => handleRejectArtist(app.id)}
                      className="px-4 py-2 rounded-lg bg-[#181719] hover:bg-red-950/50 text-red-400 border border-red-500/30 text-xs font-mono font-bold"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleApproveArtist(app.id, app.userName)}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-heading font-bold uppercase tracking-wider shadow-lg"
                    >
                      Approve & Grant Studio Access
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
