import prisma from "@/lib/db";
import TransactionList from "./TransactionList";

export const revalidate = 0;

export default async function TransaksiPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manajemen Transaksi</h1>
      <TransactionList initialTransactions={transactions} />
    </div>
  );
}
