"use server";
import { revalidatePath } from "next/cache";
import { clearAuthCookie } from "../lib/auth";

export async function logoutAction() {
  await clearAuthCookie();
  revalidatePath("/login");
}