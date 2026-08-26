import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import CheckoutForm from "./CheckoutForm";

export const revalidate = 0;

export default async function BeliPage() {
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  
  if (!config || !config.isOpen) {
    redirect("/");
  }

  const stockLeft = config.totalCoupons - config.couponsSold;
  if (stockLeft <= 0) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Beli Kupon</h1>
          <p className="text-muted-foreground">Pilih jumlah kupon dan isi data diri Anda.</p>
        </div>
        
        <CheckoutForm 
          price={config.couponPrice} 
          maxStock={stockLeft} 
        />
      </div>
    </div>
  );
}
