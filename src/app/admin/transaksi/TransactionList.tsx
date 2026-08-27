"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
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

export default function TransactionList({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = initialTransactions.filter(tx => {
    const matchFilter = filter === "ALL" || tx.status === filter;
    const matchSearch = tx.buyerName.toLowerCase().includes(search.toLowerCase()) || tx.id.includes(search);
    return matchFilter && matchSearch;
  });

  const handleAction = async (id: string, action: "VERIFY" | "REJECT") => {
    if (!confirm(`Are you sure you want to ${action} this transaction?`)) return;
    
    try {
      const res = await fetch(`/api/transactions/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to process action");
      }
    } catch {
      alert("Error processing action");
    }
  };

  return (
    <div className="space-y-6">
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
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="ALL">Semua Status</option>
          <option value="WAITING_VERIFICATION">Menunggu Verifikasi</option>
          <option value="VERIFIED">Berhasil</option>
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
                  <p className="font-mono text-sm">{tx.id.substring(0, 8)}</p>
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
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      tx.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                      tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      tx.status === 'WAITING_VERIFICATION' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {tx.status === "WAITING_VERIFICATION" && (
                      <>
                        <button onClick={() => handleAction(tx.id, "VERIFY")} className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg" title="Verifikasi Pembayaran">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleAction(tx.id, "REJECT")} className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg" title="Tolak Pembayaran">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
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
