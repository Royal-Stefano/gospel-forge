"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { UserAccount, UserRole, AccountStatus } from "@/types";
import {
  canAccessStudio,
  canPublishEpisodes,
  canManageRoles,
  canManageUsers,
} from "@/lib/auth/roles";

export const INITIAL_USERS: UserAccount[] = [
  {
    id: "usr-superadmin",
    email: "superadmin@gospelforge.com",
    username: "marcus_lead",
    displayName: "Pastor Marcus Vance",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    role: "super_admin",
    status: "active",
    bio: "Lead Overseer of Gospel Forge ministries.",
    createdAt: "2024-01-01T00:00:00Z",
    lastSignInAt: "2024-10-23T18:00:00Z",
  },
  {
    id: "usr-admin",
    email: "admin@gospelforge.com",
    username: "sarah_admin",
    displayName: "Dr. Sarah Jenkins",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    role: "admin",
    status: "active",
    bio: "Executive Producer & Theological Editor.",
    createdAt: "2024-02-15T00:00:00Z",
    lastSignInAt: "2024-10-23T15:30:00Z",
  },
  {
    id: "usr-editor",
    email: "editor@gospelforge.com",
    username: "ethan_audio",
    displayName: "Ethan Cross",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    role: "editor",
    status: "active",
    bio: "Lead Audio Engineer & Podcast Editor.",
    createdAt: "2024-03-10T00:00:00Z",
    lastSignInAt: "2024-10-22T19:40:00Z",
  },
  {
    id: "usr-listener",
    email: "listener@gospelforge.com",
    username: "danielk",
    displayName: "Daniel K.",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    role: "listener",
    status: "active",
    bio: "Follower of Jesus, lover of good conversations and biblical podcasts.",
    createdAt: "2024-06-01T00:00:00Z",
    lastSignInAt: "2024-10-23T20:10:00Z",
  },
];

interface AuthContextType {
  currentUser: UserAccount | null;
  usersList: UserAccount[];
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    pass: string,
    displayName: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<UserAccount>) => Promise<{ success: boolean; error?: string }>;
  updateUserRole: (
    targetUserId: string,
    newRole: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  toggleUserSuspension: (targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (userId?: string) => Promise<{ success: boolean; error?: string }>;
  canAccessStudio: boolean;
  canPublish: boolean;
  canManageRoles: boolean;
  canManageUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [usersList, setUsersList] = useState<UserAccount[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted session and users from localStorage
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem("gospel_users_db");
      if (storedUsers) {
        setUsersList(JSON.parse(storedUsers));
      } else {
        localStorage.setItem("gospel_users_db", JSON.stringify(INITIAL_USERS));
      }

      const storedSession = localStorage.getItem("gospel_auth_session");
      if (storedSession) {
        setCurrentUser(JSON.parse(storedSession));
      } else {
        // Default to Daniel K. (listener) for smooth public experience
        setCurrentUser(INITIAL_USERS[3]);
        localStorage.setItem("gospel_auth_session", JSON.stringify(INITIAL_USERS[3]));
      }
    } catch {
      setCurrentUser(INITIAL_USERS[3]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUsers = (updated: UserAccount[]) => {
    setUsersList(updated);
    try {
      localStorage.setItem("gospel_users_db", JSON.stringify(updated));
    } catch {}
  };

  const login = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      const normalizedEmail = email.trim().toLowerCase();
      const user = usersList.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!user) {
        return {
          success: false,
          error: "Invalid email or password. Please check your credentials.",
        };
      }

      if (user.status === "suspended") {
        return {
          success: false,
          error: "This account has been suspended by administration.",
        };
      }

      const updatedUser: UserAccount = {
        ...user,
        lastSignInAt: new Date().toISOString(),
      };

      const updatedUsersList = usersList.map((u) =>
        u.id === user.id ? updatedUser : u
      );
      saveUsers(updatedUsersList);

      setCurrentUser(updatedUser);
      try {
        localStorage.setItem("gospel_auth_session", JSON.stringify(updatedUser));
      } catch {}

      return { success: true };
    },
    [usersList]
  );

  const signup = useCallback(
    async (
      email: string,
      pass: string,
      displayName: string
    ): Promise<{ success: boolean; error?: string }> => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !pass || !displayName) {
        return { success: false, error: "All registration fields are required." };
      }

      const exists = usersList.some(
        (u) => u.email.toLowerCase() === normalizedEmail
      );
      if (exists) {
        return {
          success: false,
          error: "An account with this email address already exists.",
        };
      }

      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        email: normalizedEmail,
        username: normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, ""),
        displayName: displayName.trim(),
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80`,
        role: "listener",
        status: "active",
        createdAt: new Date().toISOString(),
        lastSignInAt: new Date().toISOString(),
      };

      const updated = [...usersList, newUser];
      saveUsers(updated);
      setCurrentUser(newUser);
      try {
        localStorage.setItem("gospel_auth_session", JSON.stringify(newUser));
      } catch {}

      return { success: true };
    },
    [usersList]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("gospel_auth_session");
    } catch {}
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ success: boolean; message: string }> => {
      return {
        success: true,
        message: `Password reset instructions have been dispatched to ${email}.`,
      };
    },
    []
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserAccount>): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser) return { success: false, error: "Not logged in" };

      // Prevent unauthorized role escalation via profile updates
      const safeUpdates = { ...updates };
      delete safeUpdates.role;
      delete safeUpdates.id;

      const updatedUser = { ...currentUser, ...safeUpdates };
      setCurrentUser(updatedUser);

      const updatedUsersList = usersList.map((u) =>
        u.id === currentUser.id ? updatedUser : u
      );
      saveUsers(updatedUsersList);

      try {
        localStorage.setItem("gospel_auth_session", JSON.stringify(updatedUser));
      } catch {}

      return { success: true };
    },
    [currentUser, usersList]
  );

  const updateUserRole = useCallback(
    async (
      targetUserId: string,
      newRole: UserRole
    ): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser || currentUser.role !== "super_admin") {
        return {
          success: false,
          error: "Permission denied: Only a Super Admin can reassign user roles.",
        };
      }

      // Safeguard: Check if removing the last active super_admin
      const targetUser = usersList.find((u) => u.id === targetUserId);
      if (!targetUser) return { success: false, error: "User not found." };

      if (targetUser.role === "super_admin" && newRole !== "super_admin") {
        const remainingSuperAdmins = usersList.filter(
          (u) => u.role === "super_admin" && u.status === "active" && u.id !== targetUserId
        );
        if (remainingSuperAdmins.length === 0) {
          return {
            success: false,
            error: "Action blocked: You cannot demote the last remaining Super Admin.",
          };
        }
      }

      const updated = usersList.map((u) =>
        u.id === targetUserId ? { ...u, role: newRole } : u
      );
      saveUsers(updated);

      if (currentUser.id === targetUserId) {
        setCurrentUser({ ...currentUser, role: newRole });
      }

      return { success: true };
    },
    [currentUser, usersList]
  );

  const toggleUserSuspension = useCallback(
    async (targetUserId: string): Promise<{ success: boolean; error?: string }> => {
      if (!currentUser || !canManageUsers(currentUser.role)) {
        return { success: false, error: "Permission denied: Admin rights required." };
      }

      const target = usersList.find((u) => u.id === targetUserId);
      if (!target) return { success: false, error: "User not found." };

      if (target.role === "super_admin") {
        return {
          success: false,
          error: "Action blocked: A Super Admin cannot be suspended.",
        };
      }

      const nextStatus: AccountStatus = target.status === "active" ? "suspended" : "active";
      const updated = usersList.map((u) =>
        u.id === targetUserId ? { ...u, status: nextStatus } : u
      );
      saveUsers(updated);

      return { success: true };
    },
    [currentUser, usersList]
  );

  const deleteAccount = useCallback(
    async (userId?: string): Promise<{ success: boolean; error?: string }> => {
      const targetId = userId || currentUser?.id;
      if (!targetId) return { success: false, error: "No account specified." };

      const target = usersList.find((u) => u.id === targetId);
      if (target?.role === "super_admin") {
        return {
          success: false,
          error: "Super Admin account cannot be deleted directly.",
        };
      }

      const updated = usersList.filter((u) => u.id !== targetId);
      saveUsers(updated);

      if (currentUser?.id === targetId) {
        logout();
      }

      return { success: true };
    },
    [currentUser, usersList, logout]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        isLoading,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
        updateUserRole,
        toggleUserSuspension,
        deleteAccount,
        canAccessStudio: canAccessStudio(currentUser?.role),
        canPublish: canPublishEpisodes(currentUser?.role),
        canManageRoles: canManageRoles(currentUser?.role),
        canManageUsers: canManageUsers(currentUser?.role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
