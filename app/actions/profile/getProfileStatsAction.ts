"use server";

import { api } from "@/app/lib/api";

export interface ProfileStats {
  profile: {
    balance: number;
  };
  statistics: {
    totalCostToday: number;
    totalTranslations: number;
    processing: number;
  };
}

export async function getProfileStatsAction() {
  try {
    const data = await api<ProfileStats>("/user/profile-stats");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
