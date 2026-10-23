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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types";
import { formatDate, cn } from "@/lib/utils";

export default function StudioUsersManager() {
  const {
    currentUser,
    usersList,
    updateUserRole,
    toggleUserSuspension,
    canManageRoles,
    canManageUsers,
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRoleSelect, setNewRoleSelect] = useState<UserRole>("listener");
  const [feedback, setFeedback] = useState<string | null>(null);

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
          User & Role Administration
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1 font-body">
          Manage accounts, assign roles, enforce suspensions, and review permissions.
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

      {/* Filter and Search */}
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

      {/* Users Table */}
      <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-[#222123] text-[#6e6f77] uppercase">
              <tr>
                <th className="pb-3">User & Email</th>
                <th className="pb-3">Role</th>
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
                          Change Role
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
  );
}
