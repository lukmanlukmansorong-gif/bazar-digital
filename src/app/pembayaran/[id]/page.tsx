import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import PaymentClient from "./PaymentClient";

export const revalidate = 0;

export default async function PembayaranPage({ params }: { params: { id: string } }) {
  const transaction = await prisma.transaction.findUnique({ where: { id: params.id } });
  
  if (!transaction) {
    redirect("/");
  }

  // If already verified or rejected, redirect to ticket page to see status
  if (transaction.status !== "PENDING") {
    redirect(`/kupon/${transaction.id}`);
  }

  const config = await prisma.config.findUnique({ where: { id: 1 } });
  
  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Selesaikan Pembayaran</h1>
          <p className="text-muted-foreground">Selesaikan pembayaran untuk mengamankan tiket Anda.</p>
        </div>
        
        <PaymentClient 
          transaction={transaction}
          config={config!}
        />
      </div>
    </div>
  );
}
