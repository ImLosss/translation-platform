import { CurrentUser } from "../components/client/UserProvider";
import { api } from "./api";

export async function getCurrentUser() {
  try {
    return await api<CurrentUser>("/auth/me");
  } catch {
    return null;
  }
}