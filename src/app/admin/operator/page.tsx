import prisma from "@/lib/db";
import OperatorManagerClient from "./OperatorManagerClient";

export const revalidate = 0;

export default async function OperatorPage() {
  const operators = await prisma.operator.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Operator Online</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Buat dan kelola banyak akun operator penjualan online (Read-Only) untuk memantau transaksi pembelian kupon.
        </p>
      </div>

      <OperatorManagerClient initialOperators={operators} />
    </div>
  );
}
