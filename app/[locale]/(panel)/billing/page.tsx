export const dynamic = 'force-dynamic';
import BillingHistoryClient, { TransactionDB } from "@/app/components/billing/BillingHistoryClient";
import { api } from "@/app/lib/api";
import { DEFAULT_LOCALE, isLocale } from "@/app/lib/i18n/locales";


export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Gunakan fungsi api bawaan Anda untuk melakukan fetch ke backend NestJS
  // Pastikan endpoint '/payment/history' sesuai dengan rute di controller Anda
  let transactions: TransactionDB[] = [];

  try {
    transactions = await api<TransactionDB[]>('/payment');
  } catch (error) {
    console.error("Gagal mengambil histori transaksi:", error);
  }

  return (
    <div className="container">
      <BillingHistoryClient
        initialTransactions={transactions}
        locale={isLocale(locale) ? locale : DEFAULT_LOCALE}
      />
    </div>
  );
}