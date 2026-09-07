"use server";

import { api } from "@/app/lib/api";

interface UpdatePayload {
    creates: any[];
    updates: any[];
    deletes: number[];
}

export async function updateRowAction(
  translationId: number,
  data: UpdatePayload,
) {
  try {
    return await api<any>(`/translate/${translationId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}