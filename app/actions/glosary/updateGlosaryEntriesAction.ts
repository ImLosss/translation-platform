"use server";

import { api } from "@/app/lib/api";
import { GlosaryEntry } from "@/app/components/glosary/GlosaryEditor"; // Sesuaikan path ini

export async function updateGlosaryEntriesAction(glosaryId: number, entries: GlosaryEntry[]) {
  try {
    // Sesuaikan endpoint sesuai dengan yang kamu daftarkan di NestJS Controller
    await api(`/glosary/${glosaryId}/entries`, {
      method: "PUT",
      body: JSON.stringify({ entries }),
    });

    return { 
      success: true, 
      message: "Glosarium berhasil diperbarui!" 
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Terjadi kesalahan saat menyimpan glosarium.",
    };
  }
}