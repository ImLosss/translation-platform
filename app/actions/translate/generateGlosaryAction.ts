"use server";

export async function generateGlossaryAction(formData: FormData) {
  const id = Number(formData.get("id"));

  // Panggil API atau langsung akses database
  console.log("Generate glossary:", id);

  // contoh:
  // await api(`/translate/${id}/generate-glossary`, { method: "POST" });
}