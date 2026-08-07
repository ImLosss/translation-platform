import FormClientEdit from "@/app/components/glosary/edit/FormClientEdit";
import { api } from "@/app/lib/api"; 

export default async function EditGlosaryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const glosaryData = await api<any>(`/glosary/${id}`); 

    return (
        <FormClientEdit initialData={glosaryData} />
    );
}