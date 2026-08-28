"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download, Share2, Clock, CheckCircle, XCircle } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Ticket {
  id: string;
  code: string;
  isRedeemed: boolean;
  redeemedAt?: string | Date | null;
}

interface Transaction {
  id: string;
  buyerName: string;
  quantity: number;
  status: string;
  tickets: Ticket[];
}

interface TicketClientProps {
  transaction: Transaction;
}

export default function TicketClient({ transaction }: TicketClientProps) {
  
  const handleDownload = async (ticketCode: string) => {
    const element = document.getElementById(`ticket-${ticketCode}`);
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${ticketCode}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to download ticket");
    }
  };

  const handleShare = (ticketCode: string) => {
    const text = `Halo! Ini E-Ticket Bazar Digital saya.\nKode Tiket: ${ticketCode}\nTerima kasih!`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  if (transaction.status === "WAITING_VERIFICATION") {
    return (
      <div className="bg-card text-card-foreground shadow-xl rounded-2xl p-8 border text-center max-w-lg mx-auto">
        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Menunggu Verifikasi</h2>
        <p className="text-muted-foreground">Pembayaran Anda sedang ditinjau oleh panitia. Silakan kembali lagi nanti atau cek pesanan Anda melalui fitur Pencarian.</p>
      </div>
    );
  }

  if (transaction.status === "REFUNDED") {
    return (
      <div className="bg-card text-card-foreground shadow-xl rounded-2xl p-8 border text-center max-w-lg mx-auto">
        <XCircle className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-purple-700">Pesanan Dibatalkan (Refund)</h2>
        <p className="text-muted-foreground">Transaksi ini telah dibatalkan / di-refund oleh panitia. Tiket tidak lagi berlaku untuk penukaran kupon.</p>
      </div>
    );
  }

  if (transaction.status === "REJECTED") {
    return (
      <div className="bg-card text-card-foreground shadow-xl rounded-2xl p-8 border text-center max-w-lg mx-auto">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-destructive">Pembayaran Ditolak</h2>
        <p className="text-muted-foreground">Mohon maaf, bukti pembayaran Anda tidak valid. Silakan hubungi Customer Service.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-green-100 border border-green-300 text-green-800 p-4 rounded-xl flex items-center gap-3">
        <CheckCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-bold">Pembayaran Berhasil!</p>
          <p className="text-sm">Berikut adalah E-Ticket Anda. Tunjukkan QR Code ini kepada panitia saat acara berlangsung.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {transaction.tickets.map((ticket: Ticket, index: number) => (
          <div key={ticket.id} className="space-y-4">
            <div 
              id={`ticket-${ticket.code}`}
              className="bg-white text-gray-900 border rounded-2xl shadow-lg overflow-hidden flex flex-row relative"
            >
              <div className="p-6 flex-1 flex flex-col justify-between border-r-2 border-dashed border-gray-300">
                <div>
                  <h3 className="text-2xl font-black text-primary mb-1">BAZAR DIGITAL</h3>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">Event 2026</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Nama Pemesan</p>
                      <p className="font-bold text-sm truncate">{transaction.buyerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Kode Tiket</p>
                      <p className="font-mono font-bold text-sm">{ticket.code}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400">Berlaku untuk 1 kali penukaran kupon</p>
                  <p className="text-xs font-bold text-gray-500">Tiket #{index + 1} dari {transaction.quantity}</p>
                </div>
              </div>

              <div className="bg-primary/5 p-6 flex flex-col items-center justify-center min-w-[160px]">
                <div className="bg-white p-2 rounded-lg shadow-sm border">
                  <QRCodeSVG value={ticket.code} size={100} level="M" />
                </div>
                {ticket.isRedeemed && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-black text-2xl -rotate-12 border-4 border-white px-4 py-2 rounded-xl">DIGUNAKAN</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleDownload(ticket.code)}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors text-sm"
              >
                <Download className="w-4 h-4" /> Unduh PDF
              </button>
              <button 
                onClick={() => handleShare(ticket.code)}
                className="flex-1 bg-green-500 text-white hover:bg-green-600 px-4 py-3 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors text-sm"
              >
                <Share2 className="w-4 h-4" /> Share WA
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
