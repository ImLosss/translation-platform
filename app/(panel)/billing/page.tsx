import BillingHistoryClient, { TransactionDB } from "@/app/components/billing/BillingHistoryClient";
import { api } from "@/app/lib/api";


export default async function BillingPage() {
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
      <BillingHistoryClient initialTransactions={transactions} />
    </div>
  );
}