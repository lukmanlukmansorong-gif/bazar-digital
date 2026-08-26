import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import TicketClient from "./TicketClient";

export const revalidate = 0;

export default async function KuponPage({ params }: { params: { id: string } }) {
  const transaction = await prisma.transaction.findUnique({ 
    where: { id: params.id },
    include: { tickets: true }
  });
  
  if (!transaction) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Status Pesanan</h1>
          <p className="text-muted-foreground">ID Transaksi: {transaction.id}</p>
        </div>
        
        <TicketClient transaction={transaction} />
      </div>
    </div>
  );
}
