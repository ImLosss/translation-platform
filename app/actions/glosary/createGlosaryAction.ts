"use server";

import { api } from "@/app/lib/api";

export async function createGlosaryAction(payload: any) {
  try {
    await api<any>("/glosary", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return { success: true, message: "Glossary created successfully!" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}