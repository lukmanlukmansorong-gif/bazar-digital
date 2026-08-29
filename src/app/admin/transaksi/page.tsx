import prisma from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import TransactionList from "./TransactionList";

export const revalidate = 0;

export default async function TransaksiPage() {
  const [transactions, session] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { tickets: true },
    }),
    getAdminSession()
  ]);

  const isReadOnly = session?.role === "operator";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Transaksi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isReadOnly ? "Mode Operator: Memantau daftar pembelian kupon daring" : "Kelola, verifikasi, dan pantau status transaksi"}
          </p>
        </div>
      </div>
      <TransactionList 
        initialTransactions={transactions} 
        isReadOnly={isReadOnly}
        operatorName={session?.name || session?.username}
      />
    </div>
  );
}

