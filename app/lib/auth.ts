import { api } from "./api";

export async function getCurrentUser() {
  try {
    return await api("/auth/me");
  } catch {
    return null;
  }
}