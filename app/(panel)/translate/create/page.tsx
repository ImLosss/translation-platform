import FormClient from "@/app/components/translate/create/FormClient";
import { api } from "@/app/lib/api";

export interface AiModelOption {
  value: string;
  label: string;
}

export default async function AdminPage() {
    const glosaries = await api<any>("/glosary");
    const providersData = await api<any[]>("/provider").catch((error) => { return [ { id: '', name: 'Something went wrong' } ]; }); 
    const aiModels: AiModelOption[] = providersData
    .filter((provider: any) => provider.status !== 'INACTIVE')
    .map((provider: any) => ({
        value: provider.id,
        label: provider.model
    }));
    return (
        <>
            <FormClient glosaries={glosaries} aiModels={aiModels} />
        </>
    );
}