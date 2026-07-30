import FormClient from "@/app/components/translate/create/FormClient";
import Dropzone from "@/app/components/translate/DropZone";
import { api } from "@/app/lib/api";1

export default async function AdminPage() {
    const glossaryData = await api("/glosary");
    return (
        <FormClient glossaryData={glossaryData} />
    );
}