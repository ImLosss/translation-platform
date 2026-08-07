"use server";

import { api } from "@/app/lib/api";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(payload: { username: string }) {
  try {
    // PATCH endpoint user yang sedang login
    await api<any>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    revalidatePath("/profile");

    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui profil.",
    };
  }
}