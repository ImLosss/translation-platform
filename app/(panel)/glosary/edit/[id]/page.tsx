import FormClientEdit from "@/app/components/glosary/edit/FormClientEdit";
import { api } from "@/app/lib/api"; 

export default async function EditGlosaryPage({ params }: { params: { id: string } }) {
    // Sesuaikan cara pemanggilan API ini dengan struktur backend Anda
    // Misalnya mengambil data glosary berdasarkan ID dari parameter URL
    const response = await api<any>(`/glosaries/${params.id}`); 
    const glosaryData = response.data; // Pastikan data memiliki id, name, sourceLanguage, targetLanguage

    return (
        <FormClientEdit initialData={glosaryData} />
    );
}