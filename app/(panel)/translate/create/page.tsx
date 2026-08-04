import FormClient from "@/app/components/translate/create/FormClient";
import { api } from "@/app/lib/api";
import FormUrlJob from "./FormUrlJob";

export default async function AdminPage() {
    const glosaries = await api("/glosary");
    return (
        <>
            <FormClient glosaries={glosaries} />
        </>
    );
}