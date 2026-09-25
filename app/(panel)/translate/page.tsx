'use client';

import TableData from "@/app/components/translate/TableData";
import TipCard from "@/app/components/ui/TipCard";
import { useTranslation } from "@/app/components/client/LanguageProvider";

export default function TranslatePage() {
  const t = useTranslation();

  return (
    <>
      <TipCard 
        title={t.translate.list.tipTitle} 
        icon="lightbulb"
      >
        {t.translate.list.tipBody1}<strong>{t.translate.list.tipBodyCompleted}</strong>{t.translate.list.tipBody2}<i className="fas fa-ellipsis-v" style={{ margin: "0 5px" }}></i>{t.translate.list.tipBody3}<strong>{t.translate.list.tipBodyGenerate}</strong>{t.translate.list.tipBody4}
      </TipCard>

      <TableData />
    </>
  );
}