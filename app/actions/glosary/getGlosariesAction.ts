'use server';

import { api } from "@/app/lib/api";
import type { GlosaryData } from "@/app/components/glosary/TableData";

export async function getGlosariesAction() {
  try {
    const glosaries = await api<GlosaryData[]>("/glosary");
    return { success: true, data: glosaries };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
