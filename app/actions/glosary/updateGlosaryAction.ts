"use server";

import { api } from "@/app/lib/api";
import { revalidatePath } from "next/cache";

export async function updateGlosaryAction(payload: any) {
  try {
    const { id, ...dataToUpdate } = payload;

    await api<any>(`/glosary/${payload.id}`, {
      method: "PATCH",
      body: JSON.stringify(dataToUpdate),
    });

    revalidatePath("/glosary");

    return { success: true, message: "Glossary updated successfully!" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}