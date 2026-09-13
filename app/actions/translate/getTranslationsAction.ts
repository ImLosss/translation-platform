'use server';

import { api } from "@/app/lib/api";
import { Translation, MetaPagination } from "@/app/components/translate/TableData"; // Sesuaikan path

// Buat interface untuk response dari backend
interface TranslationResponse {
  data: Translation[];
  meta: MetaPagination;
}

export async function getTranslationsAction(page: number = 1, limit: number = 10) {
  try {
    const response = await api<TranslationResponse>(
      `/translate?page=${page}&limit=${limit}`, 
      { cache: "no-store" }
    );
    return { success: true, response };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}