"use server";

import { api } from "@/app/lib/api";

export async function generateGlossaryAction(jobId: number) {
  try {
    return await api<any>(`/translate/generate-glossary`, {
      method: "POST",
      body: JSON.stringify({
        translationId: jobId,
      }),
    });
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}