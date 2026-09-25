'use client';

import TableData from "@/app/components/glosary/TableData";
import TipCard from "@/app/components/ui/TipCard";
import { useTranslation } from "@/app/components/client/LanguageProvider";

export default function AdminPage() {
  const t = useTranslation();

  return (
    <>
      <TipCard 
        title={t.glossary.tipTitle} 
        icon="info"
      >
        {t.glossary.tipBody}
      </TipCard>
      <TableData />
    </>
  );
}