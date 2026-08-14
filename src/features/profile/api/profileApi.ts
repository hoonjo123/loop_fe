import { env } from "@/src/config/env";
import type { ApiError } from "@/src/features/auth/api/authApi";
import { authenticatedFetch } from "@/src/shared/api/authenticatedFetch";

const apiBaseUrl = (env.apiBaseUrl || "http://localhost:8080/api").replace(/\/$/, "");

export type UserProfile = {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  introduction: string | null;
  activityArea: string | null;
  authProvider: "LOCAL" | "GOOGLE";
  createdAt: string;
};

export type ProfileUpdate = Pick<
  UserProfile,
  "nickname" | "profileImageUrl" | "introduction" | "activityArea"
>;

export type Friend = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  activityArea: string | null;
  friendedAt: string;
};

export type BlockedUser = {
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  blockedAt: string;
};

async function fetchProfile(path: string, init?: RequestInit): Promise<UserProfile> {
  const response = await authenticatedFetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { code?: string; message?: string };
    const error = new Error(body.message ?? "프로필 정보를 처리하지 못했습니다.") as ApiError;
    error.status = response.status;
    error.code = body.code;
    throw error;
  }
  return response.json() as Promise<UserProfile>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authenticatedFetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? "요청을 처리하지 못했습니다.");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const profileApi = {
  getMine: () => fetchProfile("/users/me"),
  updateMine: (profile: ProfileUpdate) => fetchProfile("/users/me", {
    method: "PUT",
    body: JSON.stringify(profile),
  }),
  getFriends: () => request<Friend[]>("/users/me/friends"),
  addFriend: (userId: number) => request<void>(`/users/me/friends/${userId}`, { method: "POST" }),
  removeFriend: (userId: number) => request<void>(`/users/me/friends/${userId}`, { method: "DELETE" }),
  getBlockedUsers: () => request<BlockedUser[]>("/users/me/blocks"),
  unblockUser: (userId: number) => request<void>(`/users/me/blocks/${userId}`, { method: "DELETE" }),
};
