import { cookies } from "next/headers";

const API_URL = process.env.API_URL!; // TANPA NEXT_PUBLIC

export async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = (await cookies()).get("auth_token")?.value;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
      ...options?.headers,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Terjadi kesalahan saat memproses permintaan.");
  }

  return data;
}