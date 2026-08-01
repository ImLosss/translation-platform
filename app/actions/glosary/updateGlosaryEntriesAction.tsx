"use server";

import { api } from "@/app/lib/api";

export async function updateGlosaryEntriesAction(
  glosaryId: number,
  entries: any[],
) {
  try {
    console.log(glosaryId, entries);
    // return await api(`/translate/${translationId}`, {
    //   method: "PATCH",
    //   body: JSON.stringify({
    //     lines,
    //   }),
    // });
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}