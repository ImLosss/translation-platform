import FormClient from "@/app/components/translate/create/FormClient";
import { api } from "@/app/lib/api";

export interface AiModelOption {
  value: string;
  label: string;
}

export default async function AdminPage() {
    const currencyData = await api<any>("/currency/convert",
        {
            method: "POST",
            body: JSON.stringify({
                amount: 2000,
                from: "IDR",
                to: "CNY"
            })
        }
    );

    console.log("Currency Data:", currencyData); // Debugging line
    const glosaries = await api<any>("/glosary");
    const providersData = await api<any[]>("/provider").catch((error) => { return [ { id: '', name: 'Something went wrong' } ]; }); 
    console.log("Providers Data:", providersData); // Debugging line
    const aiModels: AiModelOption[] = providersData.map((provider: any) => ({
        value: provider.id,
        label: provider.name
    }));
    return (
        <>
            <FormClient glosaries={glosaries} aiModels={aiModels} />
        </>
    );
}