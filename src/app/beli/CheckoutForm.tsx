"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, CreditCard, QrCode } from "lucide-react";

interface CheckoutFormProps {
  price: number;
  maxStock: number;
}

export default function CheckoutForm({ price, maxStock }: CheckoutFormProps) {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "TRANSFER">("QRIS");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleQtyChange = (val: number) => {
    if (val >= 1 && val <= maxStock) {
      setQty(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: name,
          buyerWa: wa,
          buyerEmail: email,
          notes,
          quantity: qty,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/pembayaran/${data.transactionId}`);
      } else {
        alert("Error: " + data.error);
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card text-card-foreground shadow-xl rounded-2xl p-6 md:p-8 space-y-8 border">
      {/* Quantity Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Jumlah Kupon</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/50 border">
          <div>
            <p className="font-medium">Kupon Bazar Digital 2026</p>
            <p className="text-muted-foreground text-sm">Rp {price.toLocaleString('id-ID')} / kupon</p>
          </div>
          <div className="flex items-center gap-4 bg-background border rounded-lg p-1">
            <button 
              type="button"
              onClick={() => handleQtyChange(qty - 1)}
              disabled={qty <= 1}
              className="p-2 hover:bg-muted rounded-md disabled:opacity-50 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-8 text-center font-semibold text-lg">{qty}</span>
            <button 
              type="button"
              onClick={() => handleQtyChange(qty + 1)}
              disabled={qty >= maxStock}
              className="p-2 hover:bg-muted rounded-md disabled:opacity-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          {[1, 2, 5, 10].map(val => (
            <button
              key={val}
              type="button"
              onClick={() => handleQtyChange(val)}
              disabled={val > maxStock}
              className="px-4 py-2 rounded-full border text-sm font-medium hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
            >
              +{val}
            </button>
          ))}
        </div>
      </section>

      {/* Buyer Info Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Data Pemesan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Lengkap *</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nomor WhatsApp *</label>
            <input required type="tel" value={wa} onChange={e => setWa(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="081234567890" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Email <span className="text-muted-foreground">(Opsional)</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="john@example.com" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Catatan <span className="text-muted-foreground">(Opsional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none" placeholder="Catatan untuk panitia..." />
          </div>
        </div>
      </section>

      {/* Payment Method */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`cursor-pointer flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'QRIS' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/50'}`}>
            <input type="radio" name="paymentMethod" value="QRIS" checked={paymentMethod === 'QRIS'} onChange={() => setPaymentMethod('QRIS')} className="hidden" />
            <div className={`p-3 rounded-full ${paymentMethod === 'QRIS' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">QRIS</p>
              <p className="text-xs text-muted-foreground">OVO, Gopay, Dana, dll</p>
            </div>
          </label>
          <label className={`cursor-pointer flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'TRANSFER' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/50'}`}>
            <input type="radio" name="paymentMethod" value="TRANSFER" checked={paymentMethod === 'TRANSFER'} onChange={() => setPaymentMethod('TRANSFER')} className="hidden" />
            <div className={`p-3 rounded-full ${paymentMethod === 'TRANSFER' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">Transfer Bank</p>
              <p className="text-xs text-muted-foreground">BCA, Mandiri, BRI, dll</p>
            </div>
          </label>
        </div>
      </section>

      {/* Order Summary & Submit */}
      <section className="pt-6 border-t">
        <div className="flex justify-between items-center mb-6">
          <p className="text-lg text-muted-foreground">Total Tagihan</p>
          <p className="text-3xl font-extrabold text-primary">Rp {(price * qty).toLocaleString('id-ID')}</p>
        </div>
        <button 
          type="submit" 
          disabled={loading || qty < 1} 
          className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:bg-primary/90 transition-all hover:shadow-xl shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <span className="animate-pulse">Memproses...</span>
          ) : (
            "Lanjut ke Pembayaran"
          )}
        </button>
      </section>
    </form>
  );
}
