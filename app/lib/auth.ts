import { cookies } from "next/headers";
import { CurrentUser } from "../components/client/UserProvider";
import { api } from "./api";

export async function getCurrentUser() {
  try {
    return await api<CurrentUser>("/auth/me");
  } catch {
    return null;
  }
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}