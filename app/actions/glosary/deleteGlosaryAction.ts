"use server";

import { api } from "@/app/lib/api";

export async function deleteGlosaryAction(id: number) {
  try {
    await api<any>(`/glosary/${id}`, {
      method: "DELETE",
    });

    return { success: true, message: "Glossary deleted successfully!" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghapus glosarium.",
    };
  }
}