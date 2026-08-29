"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import ThermalReceipt from "@/components/ThermalReceipt";

interface Ticket {
  id: string;
  code: string;
  isRedeemed: boolean;
}

interface Transaction {
  id: string;
  buyerName: string;
  buyerWa: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string | Date;
  tickets?: Ticket[];
}

interface TransactionListProps {
  initialTransactions: Transaction[];
  isReadOnly?: boolean;
  operatorName?: string;
}

export default function TransactionList({ 
  initialTransactions, 
  isReadOnly = false,
  operatorName 
}: TransactionListProps) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  const filtered = initialTransactions.filter(tx => {
    const matchFilter = filter === "ALL" || tx.status === filter;
    const matchSearch = tx.buyerName.toLowerCase().includes(search.toLowerCase()) || tx.id.includes(search);
    return matchFilter && matchSearch;
  });

  const handleAction = async (id: string, action: "VERIFY" | "REJECT") => {
    if (isReadOnly) return;
    const actionText = action === "VERIFY" ? "Verifikasi & Terbitkan Kupon" : "Tolak Pembayaran";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} untuk transaksi ini?`)) return;
    
    setActionLoading(id);
    try {
      const res = await fetch(`/api/transactions/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal memproses aksi.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (id: string, buyerName: string, quantity: number) => {
    if (isReadOnly) return;
    const confirmRefund = confirm(
      `⚠️ KONFIRMASI REFUND / PEMBATALAN\n\n` +
      `Pembeli: ${buyerName}\n` +
      `Jumlah: ${quantity} Kupon\n\n` +
      `Apakah Anda yakin ingin me-refund transaksi ini?\n` +
      `- Status akan diubah menjadi REFUNDED.\n` +
      `- Stok sebanyak ${quantity} kupon akan otomatis dikembalikan ke sistem.\n` +
      `- Kupon/QR Code tidak akan bisa digunakan saat di-scan.`
    );

    if (!confirmRefund) return;

    setActionLoading(id);
    try {
      const res = await fetch(`/api/transactions/${id}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Transaksi berhasil di-refund & stok kupon telah dikembalikan.");
        router.refresh();
      } else {
        alert(data.error || "Gagal memproses refund.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {isReadOnly && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="font-bold">Akses Operator Online: {operatorName || "Operator"}</p>
              <p className="text-xs text-blue-700">Anda memiliki izin untuk melihat riwayat dan status pembelian secara langsung (Read-Only).</p>
            </div>
          </div>
          <span className="text-xs bg-blue-200/80 text-blue-900 font-semibold px-2.5 py-1 rounded-full">
            Hanya Lihat
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-card p-4 rounded-xl border">
        <input 
          type="text" 
          placeholder="Cari Nama / ID Transaksi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background flex-1 max-w-sm"
        />
        <select 
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background font-medium"
        >
          <option value="ALL">Semua Status</option>
          <option value="WAITING_VERIFICATION">Menunggu Verifikasi</option>
          <option value="VERIFIED">Berhasil (Verified)</option>
          <option value="REFUNDED">Di-Refund (Batal)</option>
          <option value="REJECTED">Ditolak</option>
          <option value="PENDING">Belum Bayar</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 font-medium text-muted-foreground">ID & Tanggal</th>
              <th className="p-4 font-medium text-muted-foreground">Pembeli</th>
              <th className="p-4 font-medium text-muted-foreground">Pesanan</th>
              <th className="p-4 font-medium text-muted-foreground">Metode & Status</th>
              <th className="p-4 font-medium text-muted-foreground text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => (
              <tr key={tx.id} className="border-b hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <p className="font-mono text-sm font-semibold">{tx.id.substring(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('id-ID')}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold">{tx.buyerName}</p>
                  <p className="text-xs text-muted-foreground">{tx.buyerWa}</p>
                </td>
                <td className="p-4">
                  <p className="font-medium">{tx.quantity} Kupon</p>
                  <p className="text-xs font-bold text-primary">Rp {tx.totalAmount.toLocaleString('id-ID')}</p>
                </td>
                <td className="p-4">
                  <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{tx.paymentMethod}</span>
                  <div className="mt-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      tx.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                      tx.status === 'REFUNDED' ? 'bg-purple-100 text-purple-700 border border-purple-300' :
                      tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      tx.status === 'WAITING_VERIFICATION' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tx.status === 'REFUNDED' ? 'REFUND / BATAL' : tx.status}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    {/* Read-Only Operator View */}
                    {isReadOnly ? (
                      <div className="flex items-center gap-2">
                        {tx.status === "VERIFIED" && (
                          <ThermalReceipt data={{
                            transactionId: tx.id,
                            buyerName: tx.buyerName,
                            buyerWa: tx.buyerWa,
                            quantity: tx.quantity,
                            totalAmount: tx.totalAmount,
                            paymentMethod: tx.paymentMethod,
                            tickets: tx.tickets,
                          }} />
                        )}
                        <span className="text-xs text-muted-foreground italic px-2 py-1 bg-muted rounded">
                          Hanya Lihat
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Admin Waiting Verification Actions */}
                        {tx.status === "WAITING_VERIFICATION" && (
                          <>
                            <button 
                              onClick={() => handleAction(tx.id, "VERIFY")} 
                              disabled={actionLoading === tx.id}
                              className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors" 
                              title="Verifikasi Pembayaran"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleAction(tx.id, "REJECT")} 
                              disabled={actionLoading === tx.id}
                              className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors" 
                              title="Tolak Pembayaran"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {/* Admin Verified Actions: Print + Refund */}
                        {tx.status === "VERIFIED" && (
                          <>
                            <ThermalReceipt data={{
                              transactionId: tx.id,
                              buyerName: tx.buyerName,
                              buyerWa: tx.buyerWa,
                              quantity: tx.quantity,
                              totalAmount: tx.totalAmount,
                              paymentMethod: tx.paymentMethod,
                              tickets: tx.tickets,
                            }} />
                            <button
                              onClick={() => handleRefund(tx.id, tx.buyerName, tx.quantity)}
                              disabled={actionLoading === tx.id}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-colors text-xs font-bold"
                              title="Refund & Kembalikan Stok Kupon"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Refund
                            </button>
                          </>
                        )}

                        {/* Admin Pending Actions: Allow direct cancel/refund */}
                        {tx.status === "PENDING" && (
                          <button
                            onClick={() => handleRefund(tx.id, tx.buyerName, tx.quantity)}
                            disabled={actionLoading === tx.id}
                            className="text-xs text-muted-foreground hover:text-red-500 font-medium"
                          >
                            Batalkan
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">Tidak ada data transaksi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

