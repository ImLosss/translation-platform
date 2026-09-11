"use server";

import { api } from "@/app/lib/api";

export async function generateGlossaryAction(translationId: number) {
  try {
    const response = await api<any>(`/translate/generate-glossary`, {
      method: 'POST',
      body: JSON.stringify({ translationId })
    });
    return response;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function checkGlossaryAction(translationId: number) {
  try {
    const response = await api<any>(`/translate/check-recommendation/${translationId}`, {
      method: 'GET',
    });
    return response; 
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

interface SaveGlossaryPayload {
  translationId: number;
  glosaryId?: number;
  name: string;
  sourceLanguage: string;
  targetLanguage: string;
  creates: any[];
  updates: any[];
  deletes: number[];
}

export async function saveGlossaryAction(payload: SaveGlossaryPayload) {
  try {
    const response = await api<any>(`/translate/save-recommendation`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: "Glossary saved successfully.",
      data: response,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to save glossary.",
    };
  }
}