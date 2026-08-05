import FormClient from "@/app/components/translate/create/FormClient";
import { api } from "@/app/lib/api";

export default async function AdminPage() {
    const glosaries = await api<any>("/glosary");
    return (
        <>
            <FormClient glosaries={glosaries} />
        </>
    );
}