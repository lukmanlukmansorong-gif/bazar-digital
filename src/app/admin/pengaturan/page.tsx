import prisma from "@/lib/db";
import { updateSettings } from "./actions";

export const revalidate = 0;

export default async function PengaturanPage() {
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  if (!config) return <div>Config not found</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pengaturan Aplikasi</h1>

      <div className="bg-card border rounded-2xl p-6 max-w-2xl">
        <form action={updateSettings} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Informasi Rekening Pembayaran</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Bank (misal: BCA, Mandiri)</label>
              <input 
                type="text" 
                name="bankName" 
                defaultValue={config.bankName} 
                required 
                className="w-full px-4 py-2 border rounded-xl bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor Rekening</label>
              <input 
                type="text" 
                name="bankAccount" 
                defaultValue={config.bankAccount} 
                required 
                className="w-full px-4 py-2 border rounded-xl bg-background"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Atas Nama Rekening</label>
              <input 
                type="text" 
                name="bankAccountName" 
                defaultValue={config.bankAccountName} 
                required 
                className="w-full px-4 py-2 border rounded-xl bg-background"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-semibold border-b pb-2">Customer Service</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nomor WhatsApp CS (Gunakan format 62xxx)</label>
              <input 
                type="text" 
                name="csWhatsapp" 
                defaultValue={config.csWhatsapp} 
                required 
                className="w-full px-4 py-2 border rounded-xl bg-background"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-semibold border-b pb-2">QRIS Pembayaran</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Link Gambar QRIS (URL)</label>
              <input 
                type="text" 
                name="qrisUrl" 
                defaultValue={config.qrisUrl || ''} 
                placeholder="https://contoh.com/gambar-qris.jpg"
                className="w-full px-4 py-2 border rounded-xl bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Paste link gambar QRIS Anda di sini. Bisa dari Google Drive, Imgur, atau link lain.
              </p>
            </div>
            {config.qrisUrl && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-2">Preview QRIS:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.qrisUrl} alt="QRIS Preview" className="max-w-[200px] rounded-xl border" />
              </div>
            )}
          </div>

          <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all">
            Simpan Pengaturan
          </button>
        </form>
      </div>
    </div>
  );
}
