"use server";

import { api } from "@/app/lib/api";

export async function createFromUrlAction(payload: any) {

  console.log("Payload to be sent:", payload);

  const response = await api("/translate/drive", {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch((error) => { return { success: false, message: error.message }; });

  return response;
}