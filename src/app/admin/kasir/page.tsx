import prisma from "@/lib/db";
import KasirClient from "./KasirClient";

export const revalidate = 0;

export default async function KasirPage() {
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  if (!config) return <div>Config not found</div>;

  const stockLeft = config.totalCoupons - config.couponsSold;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Kasir Pembelian Tunai (POS)</h1>
          <p className="text-muted-foreground text-sm">Input penjualan kupon langsung di lokasi bazar (Hari-H) dan cetak tiket instan.</p>
        </div>
        <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700">Sisa Stok</span>
          <span className="text-2xl font-black text-green-700">{stockLeft} Kupon</span>
        </div>
      </div>

      <KasirClient 
        couponPrice={config.couponPrice} 
        stockLeft={stockLeft}
        eventName={config.eventName}
      />
    </div>
  );
}
