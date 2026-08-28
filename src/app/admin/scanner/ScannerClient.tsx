"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, XCircle, AlertTriangle, ScanLine } from "lucide-react";

interface TicketResult {
  id: string;
  code: string;
  isRedeemed: boolean;
  redeemedAt?: string | Date | null;
  transactionId: string;
}

interface ScanResult {
  ticket?: TicketResult;
  status?: string;
  buyerName?: string;
  error?: string;
}

export default function ScannerClient() {
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        handleCheck(decodedText);
      },
      () => {
        // ignore scan errors silently
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = async (code: string) => {
    if (!code) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "CHECK" }),
      });
      const data: ScanResult = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setResult({ error: data.error });
      }
    } catch {
      setResult({ error: "Network Error" });
    } finally {
      setLoading(false);
      setManualCode("");
    }
  };

  const handleRedeem = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "REDEEM" }),
      });
      if (res.ok) {
        setResult(prev => prev ? { 
          ...prev, 
          status: "ALREADY_REDEEMED", 
          ticket: prev.ticket ? { ...prev.ticket, isRedeemed: true } : undefined 
        } : null);
        alert("Kupon berhasil ditukarkan!");
      } else {
        alert("Gagal menukarkan kupon");
      }
    } catch {
      alert("Error menukarkan kupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Scanner Section */}
      <div className="space-y-6">
        <div className="bg-card p-4 rounded-2xl border shadow-sm">
          <h2 className="text-lg font-bold mb-4">Scan QR Code</h2>
          <div id="reader" className="w-full overflow-hidden rounded-xl border-2 border-primary/20"></div>
        </div>

        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <h2 className="text-lg font-bold mb-4">Input Manual</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Kode Tiket (contoh: BZR-2026-XXXXXX)"
              className="flex-1 px-4 py-2 border rounded-xl bg-background focus:ring-primary focus:outline-none"
            />
            <button 
              onClick={() => handleCheck(manualCode)}
              disabled={loading || !manualCode}
              className="px-6 py-2 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 disabled:opacity-50"
            >
              Cek
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <div>
        {loading && <div className="text-center p-8 bg-card rounded-2xl border animate-pulse">Memeriksa Kupon...</div>}
        
        {!loading && result && (
          <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
            {result.error === "NOT_FOUND" ? (
              <div className="p-8 text-center bg-red-50 text-red-700">
                <XCircle className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Kupon Tidak Ditemukan</h3>
                <p>Kode kupon tidak valid atau tidak terdaftar di sistem.</p>
              </div>
            ) : result.error ? (
              <div className="p-8 text-center bg-red-50 text-red-700">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Terjadi Kesalahan</h3>
                <p>{result.error}</p>
              </div>
            ) : (
              <div className="p-8">
                <div className={`text-center p-6 rounded-xl mb-6 ${
                  result.status === "VALID" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {result.status === "VALID" ? (
                    <>
                      <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                      <h3 className="text-2xl font-bold">Kupon Valid</h3>
                      <p>Kupon dapat digunakan.</p>
                    </>
                  ) : result.status === "REFUNDED" ? (
                    <div className="text-purple-800">
                      <XCircle className="w-16 h-16 mx-auto mb-2 text-purple-600" />
                      <h3 className="text-2xl font-bold">Kupon Dibatalkan (Refund)</h3>
                      <p className="text-sm mt-1">Kupon ini telah di-refund oleh panitia dan tidak dapat digunakan.</p>
                    </div>
                  ) : (
                    <>
                      <XCircle className="w-16 h-16 mx-auto mb-2" />
                      <h3 className="text-2xl font-bold">Sudah Digunakan</h3>
                      <p>Kupon ini telah ditukarkan sebelumnya.</p>
                    </>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Kode Kupon</span>
                    <span className="font-mono font-bold">{result.ticket?.code}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Nama Pembeli</span>
                    <span className="font-bold">{result.buyerName}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-bold">{result.ticket?.isRedeemed ? "TERPAKAI" : "BELUM TERPAKAI"}</span>
                  </div>
                  {result.ticket?.redeemedAt && (
                    <div className="flex justify-between pb-2 text-sm">
                      <span className="text-muted-foreground">Waktu Tukar</span>
                      <span className="font-medium">{new Date(result.ticket.redeemedAt as string).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                {result.status === "VALID" && result.ticket && (
                  <button 
                    onClick={() => handleRedeem(result.ticket!.code)}
                    disabled={loading}
                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all text-lg shadow-lg shadow-primary/20"
                  >
                    Tandai Telah Digunakan (Redeem)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!loading && !result && (
          <div className="bg-card border border-dashed rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center h-full min-h-[300px]">
            <ScanLine className="w-16 h-16 mb-4 opacity-50" />
            <p>Arahkan kamera ke QR Code tiket<br/>atau masukkan kode secara manual.</p>
          </div>
        )}
      </div>
    </div>
  );
}
