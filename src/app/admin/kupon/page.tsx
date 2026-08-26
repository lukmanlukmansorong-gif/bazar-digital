import prisma from "@/lib/db";
import { updateConfig } from "./actions";

export const revalidate = 0;

export default async function KuponPage() {
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  if (!config) return <div>Config not found</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manajemen Kupon & Stok</h1>

      <div className="bg-card border rounded-2xl p-6 max-w-2xl">
        <form action={updateConfig} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Event Bazar</label>
            <input 
              type="text" 
              name="eventName" 
              defaultValue={config.eventName} 
              required 
              className="w-full px-4 py-2 border rounded-xl bg-background"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Harga Satuan Kupon (Rp)</label>
              <input 
                type="number" 
                name="couponPrice" 
                defaultValue={config.couponPrice} 
                required 
                min="0"
                className="w-full px-4 py-2 border rounded-xl bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Kupon Dicetak</label>
              <input 
                type="number" 
                name="totalCoupons" 
                defaultValue={config.totalCoupons} 
                required 
                min={config.couponsSold}
                className="w-full px-4 py-2 border rounded-xl bg-background"
              />
              <p className="text-xs text-muted-foreground">Minimal {config.couponsSold} (karena sudah terjual)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-muted p-4 rounded-xl border">
            <input 
              type="checkbox" 
              name="isOpen" 
              id="isOpen" 
              defaultChecked={config.isOpen} 
              className="w-5 h-5 accent-primary"
            />
            <label htmlFor="isOpen" className="font-medium cursor-pointer">Buka Penjualan Bazar</label>
          </div>

          <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all">
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}
