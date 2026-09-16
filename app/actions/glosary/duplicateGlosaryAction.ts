"use server";

import { api } from "@/app/lib/api";

export async function duplicateGlosaryAction(id: number) {
  try {
    const response = await api<any>(`/glosary/duplicate/${id}`, {
      method: "GET",
    });

    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to duplicate glosary.",
    };
  }
}