"use server";

import { api } from "@/app/lib/api";

interface UpdatePayload {
  creates: any[];
  updates: any[];
  deletes: number[];
}

export async function updateGlosaryEntriesAction(glosaryId: number, data: UpdatePayload) {
  try {
    await api<any>(`/glosary/${glosaryId}/entries`, {
      method: "PUT",
      body: JSON.stringify(data), 
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