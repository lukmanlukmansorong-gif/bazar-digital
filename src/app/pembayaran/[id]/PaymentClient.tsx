"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, UploadCloud, CheckCircle } from "lucide-react";
import Image from "next/image";

interface Transaction {
  id: string;
  paymentMethod: string;
  totalAmount: number;
  quantity: number;
}

interface Config {
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
}

interface PaymentClientProps {
  transaction: Transaction;
  config: Config;
}

export default function PaymentClient({ transaction, config }: PaymentClientProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = () => {
    navigator.clipboard.writeText(config.bankAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofUrl: "dummy-proof-url" })
      });
      if (res.ok) {
        router.push(`/kupon/${transaction.id}`);
      } else {
        alert("Failed to process payment");
      }
    } catch {
      alert("Error processing payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card text-card-foreground shadow-xl rounded-2xl border overflow-hidden">
      <div className="p-6 md:p-8 border-b bg-muted/20">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Total Pembayaran</p>
          <p className="text-3xl font-extrabold text-primary">Rp {transaction.totalAmount.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {transaction.paymentMethod === "QRIS" ? (
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold">Scan QRIS</h3>
            <div className="bg-white p-4 inline-block rounded-xl border-4 border-primary mx-auto shadow-sm">
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BazarDigital-${transaction.id}`}
                alt="QRIS Payment Code"
                width={192}
                height={192}
                unoptimized
              />
            </div>
            <p className="text-sm text-muted-foreground">Buka aplikasi e-wallet Anda (Gopay, OVO, Dana) atau Mobile Banking, lalu scan QR Code di atas.</p>
            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex justify-center items-center gap-2"
            >
              {loading ? "Memproses..." : "Simulasi Pembayaran Sukses"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Transfer Bank</h3>
            <div className="bg-muted p-4 rounded-xl border">
              <p className="text-sm text-muted-foreground mb-1">Bank Tujuan</p>
              <p className="font-bold text-lg">{config.bankName}</p>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">Nomor Rekening</p>
                <div className="flex items-center justify-between bg-background p-3 rounded-lg border">
                  <span className="font-mono text-xl tracking-wider">{config.bankAccount}</span>
                  <button onClick={handleCopy} className="text-primary hover:bg-primary/10 p-2 rounded-md transition-colors flex items-center gap-1">
                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span className="text-sm font-medium">{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">A.n. <span className="font-semibold text-foreground">{config.bankAccountName}</span></p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Bukti Transfer</label>
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 cursor-pointer transition-colors">
                <UploadCloud className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Klik atau drag file gambar kesini</p>
                <p className="text-xs text-muted-foreground mt-1">Simulasi: Cukup klik Konfirmasi Pembayaran di bawah.</p>
              </div>
            </div>

            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex justify-center items-center gap-2"
            >
              {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
