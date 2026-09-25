"use server";

import { api } from "@/app/lib/api";

export interface UsagePoint {
  date: string;
  label: string;
  fullLabel: string;
  translations: number;
  completed: number;
  cost: number;
  tokens: number;
}

export interface UsageStatsResponse {
  days: number;
  timeZone: string;
  data: UsagePoint[];
  summary: {
    translations: number;
    cost: number;
    tokens: number;
  };
}

export async function getUsageStatsAction(days: number = 30) {
  try {
    const response = await api<UsageStatsResponse>(
      `/user/usage-stats?days=${days}`,
      { cache: "no-store" }
    );
    return { success: true, response };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
