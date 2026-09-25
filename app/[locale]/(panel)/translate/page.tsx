import TableData from "@/app/components/translate/TableData";
import TipCard from "@/app/components/ui/TipCard";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale } from "@/app/lib/i18n/locales";

export default async function TranslatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);

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