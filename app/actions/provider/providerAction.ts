"use server";

import { api } from "@/app/lib/api";
import { revalidatePath } from "next/cache";

// Mengambil semua data Provider
export async function getProvidersAction() {
  try {
    const data = await api<any[]>("/provider", {
      method: "GET",
    });

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

// Menyimpan (Create) atau Memperbarui (Update) Provider
export async function saveProviderAction(payload: any, id?: number) {
  try {
    const method = id ? "PATCH" : "POST";
    const endpoint = id ? `/provider/${id}` : "/provider";

    // Pastikan tipe data sesuai dengan DTO NestJS
    const payloadData = {
      name: payload.name,
      inputPricing: Number(payload.inputPricing),
      inputCachePricing: Number(payload.inputCachePricing),
      outputPricing: Number(payload.outputPricing),
      status: payload.status,
    };

    await api<any>(endpoint, {
      method,
      body: JSON.stringify(payloadData),
    });

    revalidatePath("/providers"); // Refresh cache halaman setelah sukses
    return { success: true, message: `Provider ${id ? 'updated' : 'created'} successfully!` };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}

// Menghapus Provider
export async function deleteProviderAction(id: number) {
  try {
    await api<any>(`/provider/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/providers");
    return { success: true, message: "Provider deleted successfully!" };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
}