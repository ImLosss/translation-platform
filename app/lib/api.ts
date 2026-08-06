import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL!; // TANPA NEXT_PUBLIC

export async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = (await cookies()).get("auth_token")?.value;

  // 1. Siapkan header dasar (termasuk token jika ada)
  const defaultHeaders: Record<string, string> = {
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };

  // 2. HANYA tambahkan Content-Type jika request membawa body
  if (options?.body) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  // 3. Lakukan fetch
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers, // Memungkinkan override header dari luar jika diperlukan
    },
    cache: "no-store",
  });

  if (response.status === 401) redirect("/logout");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Terjadi kesalahan saat memproses permintaan.");
  }

  return data;
}