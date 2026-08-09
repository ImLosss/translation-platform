"use server";

import { api } from "@/app/lib/api";

export async function generateGlossaryAction(jobId: number) {
  try {
    const response = await api<any>(`/translate/generate-glossary`, {
      method: "POST",
      body: JSON.stringify({
        translationId: jobId,
      }),
    });

    return {
      success: true,
      message: "Glossary generated successfully.",
      data: response,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}