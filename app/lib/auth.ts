import { api } from "./api";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  role: "ADMIN" | "USER";
}

export async function getCurrentUser() {
  try {
    return await api<CurrentUser>("/auth/me");
  } catch {
    return null;
  }
}