"use server";

import { api } from "@/app/lib/api";

export async function createAction(payload: any) {

  console.log("Payload to be sent:", payload);

  const response = await api<any>("/translate", {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch((error) => { return { success: false, message: error.message }; });

  return response;
}