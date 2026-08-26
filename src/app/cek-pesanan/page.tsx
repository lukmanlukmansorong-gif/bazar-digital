"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

interface Transaction {
  id: string;
  quantity: number;
  status: string;
  createdAt: string | Date;
  buyerName: string;
}

export default function CekPesananPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch("/api/transactions/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.transactions);
      } else {
        setResults([]);
      }
    } catch {
      console.error("Search error");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Cek Pesanan</h1>
          <p className="text-muted-foreground">Lacak status pesanan dan e-ticket Anda.</p>
        </div>
        
        <div className="bg-card shadow-xl rounded-2xl p-6 md:p-8 border mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Nomor WhatsApp atau ID Transaksi..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-70"
            >
              {loading ? "Mencari..." : "Cari"}
            </button>
          </form>
        </div>

        {searched && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Hasil Pencarian ({results.length})</h2>
            
            {results.length === 0 ? (
              <div className="text-center p-8 bg-card rounded-xl border border-dashed">
                <p className="text-muted-foreground">Tidak ada pesanan ditemukan.</p>
              </div>
            ) : (
              results.map(tx => (
                <div key={tx.id} className="bg-card p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{tx.id.substring(0, 8)}...</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        tx.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                        tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        tx.status === 'WAITING_VERIFICATION' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <p className="font-bold text-lg">{tx.quantity} Kupon</p>
                    <p className="text-sm text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  
                  <Link 
                    href={tx.status === 'PENDING' ? `/pembayaran/${tx.id}` : `/kupon/${tx.id}`}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium px-4 py-2 rounded-lg bg-primary/10"
                  >
                    {tx.status === 'PENDING' ? 'Selesaikan Pembayaran' : 'Lihat Tiket'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
