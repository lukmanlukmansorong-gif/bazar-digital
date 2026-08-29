import prisma from "@/lib/db";
import { updateSettings } from "./actions";

export const revalidate = 0;

export default async function PengaturanPage() {
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  if (!config) return <div>Config not found</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Pengaturan Aplikasi</h1>

      <div className="bg-card border rounded-2xl p-6 md:p-8 max-w-2xl shadow-sm">
        <form action={updateSettings} className="space-y-8">
          
          {/* Section 1: Rekening Pembayaran */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2 text-gray-900">Informasi Rekening Pembayaran</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Nama Bank (misal: BCA, Mandiri, BRI)</label>
              <input 
                type="text" 
                name="bankName" 
                defaultValue={config.bankName} 
                required 
                className="w-full px-4 py-2.5 border rounded-xl bg-background text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Nomor Rekening</label>
              <input 
                type="text" 
                name="bankAccount" 
                defaultValue={config.bankAccount} 
                required 
                className="w-full px-4 py-2.5 border rounded-xl bg-background text-sm font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Atas Nama Rekening</label>
              <input 
                type="text" 
                name="bankAccountName" 
                defaultValue={config.bankAccountName} 
                required 
                className="w-full px-4 py-2.5 border rounded-xl bg-background text-sm"
              />
            </div>
          </div>

          {/* Section 2: QRIS Pembayaran */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-bold border-b pb-2 text-gray-900">QRIS Pembayaran</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Link Gambar QRIS (URL)</label>
              <input 
                type="text" 
                name="qrisUrl" 
                defaultValue={config.qrisUrl || ''} 
                placeholder="https://contoh.com/gambar-qris.jpg"
                className="w-full px-4 py-2.5 border rounded-xl bg-background text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Paste link gambar QRIS Anda (bisa upload di Imgur, Google Drive, dll).
              </p>
            </div>
            {config.qrisUrl && (
              <div className="mt-2 bg-muted/40 p-4 rounded-xl border inline-block">
                <p className="text-xs font-bold text-gray-700 mb-2">Preview QRIS:</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.qrisUrl} alt="QRIS Preview" className="max-w-[180px] rounded-lg border shadow-sm" />
              </div>
            )}
          </div>

          {/* Section 3: Customer Service */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-xl font-bold border-b pb-2 text-gray-900">Customer Service</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Nomor WhatsApp CS (Format: 628xxx)</label>
              <input 
                type="text" 
                name="csWhatsapp" 
                defaultValue={config.csWhatsapp} 
                required 
                className="w-full px-4 py-2.5 border rounded-xl bg-background text-sm font-mono"
              />
            </div>
          </div>

          {/* Section 4: Ganti Akun & Password Admin */}
          <div className="space-y-4 pt-4 border-t bg-amber-50/50 p-5 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-amber-950">🔐 Keamanan & Ganti Password Admin (Utama)</h2>
            </div>
            <p className="text-xs text-amber-800">
              Akun Administrator memiliki akses penuh ke seluruh menu (Dashboard, POS Kasir, Kupon, Transaksi, Scanner, Pengaturan). Kosongkan kolom password jika tidak ingin mengubah password admin.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Username Admin</label>
              <input 
                type="text" 
                name="adminUsername" 
                defaultValue={config.adminUsername || 'admin'} 
                required 
                className="w-full px-4 py-2.5 border rounded-xl bg-background text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">Password Baru Admin</label>
              <input 
                type="password" 
                name="adminPassword" 
                placeholder="Masukkan password baru admin (biarkan kosong jika tidak diubah)" 
                className="w-full px-4 py-2.5 border rounded-xl bg-background text-sm"
              />
            </div>
          </div>

          {/* Section 5: Akun Operator Penjualan Online (Hanya Lihat Transaksi) */}
          <div className="space-y-4 pt-4 border-t bg-blue-50/50 p-5 rounded-2xl border border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-blue-950">👥 Manajemen Banyak Operator Online</h2>
              </div>
              <a
                href="/admin/operator"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Buka Kelola Operator →
              </a>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Anda dapat membuat dan mengelola <strong>banyak akun operator sekaligus</strong> (3, 5, atau lebih) dengan nama dan username masing-masing pada menu <a href="/admin/operator" className="underline font-bold">Operator Online</a>.
            </p>
          </div>

          <button 
            type="submit" 
            className="w-full sm:w-auto px-8 py-3.5 bg-primary text-primary-foreground font-black rounded-xl hover:bg-primary/90 transition-all shadow-md"
          >
            Simpan Semua Pengaturan
          </button>
        </form>
      </div>
    </div>
  );
}
