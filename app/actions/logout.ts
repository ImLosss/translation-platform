"use server";
import { clearAuthCookie } from "../lib/auth";

export async function logoutAction() {
  await clearAuthCookie();
}