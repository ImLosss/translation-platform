'use server';

import { api } from "@/app/lib/api";
import { Translation } from "@/app/components/translate/TableData"; 

export async function getTranslationsAction() {
  try {
    const jobs = await api<Translation[]>("/translate", { cache: "no-store" });
    return { success: true, data: jobs };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}