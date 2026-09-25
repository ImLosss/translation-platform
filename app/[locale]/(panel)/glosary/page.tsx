import TableData from "@/app/components/glosary/TableData";
import TipCard from "@/app/components/ui/TipCard";
import { getDictionary } from "@/app/lib/i18n/dictionaries";
import { DEFAULT_LOCALE, isLocale } from "@/app/lib/i18n/locales";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE);

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