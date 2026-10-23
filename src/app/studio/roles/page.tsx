"use client";

import React from "react";
import { ShieldCheck, Lock, Key, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StudioRolesSecurityPage() {
  const { currentUser } = useAuth();

  const permissionsMatrix = [
    { permission: "Stream public episodes & playlists", listener: true, editor: true, admin: true, super_admin: true },
    { permission: "Save episodes & comment in community", listener: true, editor: true, admin: true, super_admin: true },
    { permission: "Access Gospel Forge Studio", listener: false, editor: true, admin: true, super_admin: true },
    { permission: "Upload media files & audio masters", listener: false, editor: true, admin: true, super_admin: true },
    { permission: "Create & edit draft episodes", listener: false, editor: true, admin: true, super_admin: true },
    { permission: "Publish episodes publicly", listener: false, editor: false, admin: true, super_admin: true },
    { permission: "Schedule automated publication", listener: false, editor: false, admin: true, super_admin: true },
    { permission: "Moderate community & hide spam", listener: false, editor: true, admin: true, super_admin: true },
    { permission: "Suspend & manage user accounts", listener: false, editor: false, admin: true, super_admin: true },
    { permission: "Reassign user roles (promote/demote)", listener: false, editor: false, admin: false, super_admin: true },
    { permission: "Manage platform secrets & RSS feeds", listener: false, editor: false, admin: false, super_admin: true },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
          Roles & Access Control Matrix
        </h1>
        <p className="text-sm text-[#a5a6af] mt-1 font-body">
          Strict database Row Level Security and server-side authorization policies.
        </p>
      </div>

      {/* Permissions Matrix Table */}
      <div className="p-6 rounded-3xl bg-[#111113] border border-[#222123] shadow-xl overflow-hidden">
        <h3 className="font-heading text-lg font-bold text-white mb-4">
          Hierarchical RBAC Permission Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-[#222123] text-[#6e6f77] uppercase">
              <tr>
                <th className="pb-3">Capability / Operation</th>
                <th className="pb-3 text-center">Listener</th>
                <th className="pb-3 text-center">Editor</th>
                <th className="pb-3 text-center">Admin</th>
                <th className="pb-3 text-center">Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181719]">
              {permissionsMatrix.map((row) => (
                <tr key={row.permission} className="hover:bg-[#161517]">
                  <td className="py-3 text-white font-medium">{row.permission}</td>
                  <td className="py-3 text-center">
                    {row.listener ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-[#3a393c]">—</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {row.editor ? (
                      <CheckCircle className="w-4 h-4 text-blue-400 mx-auto" />
                    ) : (
                      <span className="text-[#3a393c]">—</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {row.admin ? (
                      <CheckCircle className="w-4 h-4 text-[#ffb13b] mx-auto" />
                    ) : (
                      <span className="text-[#3a393c]">—</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {row.super_admin ? (
                      <CheckCircle className="w-4 h-4 text-[#ff4500] mx-auto" />
                    ) : (
                      <span className="text-[#3a393c]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Super Admin Bootstrap Documentation */}
      <div className="p-6 rounded-3xl bg-[#140e0b] border border-[#ff4500]/30 space-y-3">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-[#ff4500]" />
          <h3 className="font-heading text-lg font-bold text-white">
            Super Admin Initial Bootstrap Procedure
          </h3>
        </div>
        <p className="text-xs text-[#a5a6af] font-body leading-relaxed">
          In production Supabase deployments, the initial super-admin is bootstrapped
          directly via PostgreSQL SQL console or service-role CLI to prevent client-side elevation attacks:
        </p>
        <pre className="p-4 rounded-xl bg-[#080706] text-[#ffb13b] font-mono text-xs overflow-x-auto border border-[#2a2929]">
          {`-- Run once in Supabase SQL editor:
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'superadmin@gospelforge.com';`}
        </pre>
      </div>
    </div>
  );
}
