"use server";

import { api } from "@/app/lib/api";

export async function updateRowAction(
  translationId: number,
  lines: any[],
) {
  try {
    return await api(`/translate/${translationId}`, {
      method: "PATCH",
      body: JSON.stringify({
        lines,
      }),
    });
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}