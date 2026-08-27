"use client";

import { useState } from "react";
import { ShoppingBag, Printer, CheckCircle, Plus, Minus, User, Phone, Banknote, RefreshCw } from "lucide-react";
import ThermalReceipt from "@/components/ThermalReceipt";

interface KasirClientProps {
  couponPrice: number;
  stockLeft: number;
  eventName: string;
}

interface TicketResult {
  id: string;
  code: string;
  isRedeemed: boolean;
}

interface TransactionResult {
  id: string;
  buyerName: string;
  buyerWa: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  tickets: TicketResult[];
}

export default function KasirClient({ couponPrice, stockLeft, eventName }: KasirClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState("");
  const [buyerWa, setBuyerWa] = useState("");
  const [cashReceived, setCashReceived] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastTransaction, setLastTransaction] = useState<TransactionResult | null>(null);

  const totalAmount = quantity * couponPrice;
  const numCash = typeof cashReceived === "number" ? cashReceived : 0;
  const change = numCash >= totalAmount ? numCash - totalAmount : 0;

  const handleQuickQty = (amount: number) => {
    setQuantity(prev => {
      const next = prev + amount;
      if (next < 1) return 1;
      if (next > stockLeft) return stockLeft;
      return next;
    });
  };

  const handleQuickCash = (amount: number) => {
    setCashReceived(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 1 || quantity > stockLeft) {
      setError("Jumlah kupon tidak sesuai dengan stok");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/pos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName,
          buyerWa,
          quantity,
          notes: "Kasir Tunai On-the-spot",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Gagal membuat transaksi kasir");
        setLoading(false);
        return;
      }

      setLastTransaction(data.transaction);
      
      // Auto-trigger print for thermal receipt
      setTimeout(() => {
        triggerAutoPrint(data.transaction);
      }, 300);

      // Reset form
      setQuantity(1);
      setBuyerName("");
      setBuyerWa("");
      setCashReceived("");
    } catch {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const triggerAutoPrint = (tx: TransactionResult) => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Struk Kupon - ${tx.buyerName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            max-width: 80mm;
            padding: 4mm;
            font-size: 12px;
            color: #000;
            background: #fff;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .separator { border-top: 1px dashed #000; margin: 6px 0; }
          .double-separator { border-top: 2px double #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 2px 0; }
          .title { font-size: 18px; font-weight: bold; letter-spacing: 2px; }
          .subtitle { font-size: 10px; color: #555; }
          .ticket-box {
            border: 1px dashed #000;
            padding: 8px;
            margin: 6px 0;
            text-align: center;
            page-break-inside: avoid;
          }
          .ticket-code { font-size: 14px; font-weight: bold; letter-spacing: 1px; margin: 4px 0; }
          .qr-container { display: flex; justify-content: center; margin: 6px 0; }
          .footer { font-size: 9px; text-align: center; margin-top: 10px; color: #666; }
          @media print {
            body { width: 80mm; }
            @page { size: 80mm auto; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="center">
          <p class="title">BAZAR DIGITAL</p>
          <p class="subtitle">${eventName || "Event 2026"}</p>
        </div>
        
        <div class="double-separator"></div>
        
        <div class="row">
          <span>Tanggal</span>
          <span>${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
        <div class="row">
          <span>Waktu</span>
          <span>${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="row">
          <span>ID Trx</span>
          <span>${tx.id.substring(0, 8).toUpperCase()}</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="row">
          <span>Pembeli</span>
          <span class="bold">${tx.buyerName}</span>
        </div>
        <div class="row">
          <span>Metode</span>
          <span class="bold">TUNAI (CASH)</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="row">
          <span>Jumlah Kupon</span>
          <span class="bold">${tx.quantity} pcs</span>
        </div>
        <div class="row bold" style="font-size:14px; margin-top:4px;">
          <span>TOTAL BAYAR</span>
          <span>Rp ${tx.totalAmount.toLocaleString('id-ID')}</span>
        </div>
        
        <div class="double-separator"></div>
        
        <p class="center bold" style="margin-bottom:6px;">--- E-TICKET KUPON ---</p>
        
        ${tx.tickets.map((ticket, i) => `
          <div class="ticket-box">
            <p style="font-size:10px; color:#666;">Tiket #${i + 1} dari ${tx.quantity}</p>
            <p class="ticket-code">${ticket.code}</p>
            <div class="qr-container">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(ticket.code)}" 
                   alt="QR ${ticket.code}" 
                   width="120" height="120"
                   style="image-rendering: pixelated;" />
            </div>
            <p style="font-size:9px; color:#888;">Berlaku 1x penukaran kupon</p>
          </div>
        `).join('')}
        
        <div class="separator"></div>
        
        <div class="footer">
          <p>Tunjukkan QR Code kupon ini</p>
          <p>ke petugas stand saat pengambilan.</p>
          <p style="margin-top:6px;">Terima kasih atas partisipasinya!</p>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kasir Form (Left 2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Jumlah Kupon */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Jumlah Kupon yang Dibeli</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleQuickQty(-1)}
                className="w-14 h-14 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-black text-2xl flex items-center justify-center transition-all active:scale-95"
              >
                <Minus className="w-6 h-6" />
              </button>
              <div className="flex-1 bg-muted/30 border-2 border-primary/20 rounded-2xl py-3 px-6 text-center">
                <input
                  type="number"
                  min="1"
                  max={stockLeft}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setQuantity(isNaN(val) ? 1 : Math.max(1, Math.min(stockLeft, val)));
                  }}
                  className="w-full text-center text-4xl font-black bg-transparent focus:outline-none text-primary"
                />
                <span className="text-xs text-muted-foreground font-semibold">Lembar Kupon</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickQty(1)}
                className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-black text-2xl flex items-center justify-center transition-all active:scale-95"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Qty Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[1, 2, 5, 10].map((qty) => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => setQuantity(qty)}
                  className={`py-2 rounded-xl font-bold text-sm border transition-all ${
                    quantity === qty 
                      ? "bg-primary text-white border-primary shadow-sm" 
                      : "bg-background hover:bg-muted text-gray-700"
                  }`}
                >
                  +{qty} Lembar
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Pembeli (Opsional) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Nama Pembeli <span className="text-xs text-muted-foreground font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              />
            </div>

            {/* WhatsApp (Opsional) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                No. WhatsApp <span className="text-xs text-muted-foreground font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="08123456789"
                value={buyerWa}
                onChange={(e) => setBuyerWa(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Kalkulator Uang Tunai & Kembalian */}
          <div className="bg-muted/40 border border-border p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold flex items-center gap-2">
                <Banknote className="w-4 h-4 text-primary" />
                Uang Tunai Diterima
              </span>
              <span className="text-xs text-muted-foreground font-medium">Bantu hitung kembalian</span>
            </div>

            <input
              type="number"
              placeholder={`Rp ${totalAmount.toLocaleString('id-ID')}`}
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value ? parseInt(e.target.value, 10) : "")}
              className="w-full px-4 py-3 rounded-xl border bg-background text-lg font-bold text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none"
            />

            {/* Quick Cash Presets */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickCash(totalAmount)}
                className="px-3 py-1.5 bg-background border rounded-lg text-xs font-bold hover:bg-muted"
              >
                Uang Pas (Rp {totalAmount.toLocaleString('id-ID')})
              </button>
              {[20000, 50000, 100000, 200000].filter(v => v > totalAmount).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickCash(amt)}
                  className="px-3 py-1.5 bg-background border rounded-lg text-xs font-bold hover:bg-muted"
                >
                  Rp {amt.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            {typeof cashReceived === "number" && cashReceived >= totalAmount && (
              <div className="bg-green-100 border border-green-200 text-green-900 p-3 rounded-xl flex justify-between items-center">
                <span className="text-sm font-bold">Uang Kembalian:</span>
                <span className="text-xl font-black text-green-700">Rp {change.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || stockLeft <= 0}
            className="w-full py-4 bg-primary text-primary-foreground font-black text-lg rounded-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Menerbitkan Tiket...
              </>
            ) : (
              <>
                <Printer className="w-6 h-6" />
                Bayar Rp {totalAmount.toLocaleString('id-ID')} & Cetak Tiket
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Column: Ringkasan & Transaksi Terakhir */}
      <div className="space-y-6">
        {/* Ringkasan Bayar */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-lg border-b pb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Ringkasan Tagihan
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Harga Kupon Satuan</span>
              <span className="font-semibold">Rp {couponPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah Kupon</span>
              <span className="font-bold">{quantity} Pcs</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Pembayaran</span>
              <span className="text-2xl font-black text-primary">Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Transaksi Terakhir Berhasil */}
        {lastTransaction && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 shadow-md space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-6 h-6" />
              <h3 className="font-black text-lg">Tiket Berhasil Dicetak!</h3>
            </div>
            <div className="space-y-2 text-sm text-green-950">
              <p><strong>Pembeli:</strong> {lastTransaction.buyerName}</p>
              <p><strong>Jumlah:</strong> {lastTransaction.quantity} Kupon</p>
              <p><strong>Total:</strong> Rp {lastTransaction.totalAmount.toLocaleString('id-ID')}</p>
              <div className="pt-2">
                <p className="text-xs font-bold text-green-800 mb-1">Kode Tiket Terbit:</p>
                <div className="flex flex-wrap gap-1">
                  {lastTransaction.tickets.map((t) => (
                    <span key={t.id} className="bg-white border border-green-300 px-2 py-1 rounded text-xs font-mono font-bold">
                      {t.code}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-green-200">
              <ThermalReceipt data={{
                transactionId: lastTransaction.id,
                buyerName: lastTransaction.buyerName,
                buyerWa: lastTransaction.buyerWa,
                quantity: lastTransaction.quantity,
                totalAmount: lastTransaction.totalAmount,
                paymentMethod: lastTransaction.paymentMethod,
                eventName: eventName,
                tickets: lastTransaction.tickets,
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
