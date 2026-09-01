"use client";

import { useState } from "react";
import { Printer, Loader2 } from "lucide-react";

interface TicketData {
  id?: string;
  code: string;
  isRedeemed?: boolean;
}

interface ReceiptData {
  transactionId: string;
  buyerName: string;
  buyerWa: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  eventName?: string;
  tickets?: TicketData[];
}

export default function ThermalReceipt({ data }: { data: ReceiptData }) {
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    setLoading(true);
    let ticketsToPrint: TicketData[] = data.tickets || [];

    // If tickets are not attached, fetch from API or fallback
    if (!ticketsToPrint || ticketsToPrint.length === 0) {
      try {
        const res = await fetch(`/api/transactions/${data.transactionId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.tickets && json.tickets.length > 0) {
            ticketsToPrint = json.tickets;
          }
        }
      } catch (e) {
        console.error("Failed to fetch tickets", e);
      }
    }

    // Fallback if still empty
    if (!ticketsToPrint || ticketsToPrint.length === 0) {
      ticketsToPrint = [{
        code: `TRX-${data.transactionId.substring(0, 8).toUpperCase()}`,
        isRedeemed: false,
      }];
    }

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      alert("Popup terblokir. Izinkan popup di browser Anda.");
      setLoading(false);
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Struk Kupon - ${data.buyerName}</title>
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
          <p class="subtitle">${data.eventName || "Event 2026"}</p>
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
          <span>${data.transactionId.substring(0, 8).toUpperCase()}</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="row">
          <span>Pembeli</span>
          <span class="bold">${data.buyerName}</span>
        </div>
        <div class="row">
          <span>No. WA</span>
          <span>${data.buyerWa}</span>
        </div>
        <div class="row">
          <span>Metode</span>
          <span class="bold">${data.paymentMethod}</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="row">
          <span>Jumlah Kupon</span>
          <span class="bold">${data.quantity} pcs</span>
        </div>
        <div class="row bold" style="font-size:14px; margin-top:4px;">
          <span>TOTAL BAYAR</span>
          <span>Rp ${data.totalAmount.toLocaleString('id-ID')}</span>
        </div>
        
        <div class="double-separator"></div>
        
        <p class="center bold" style="margin-bottom:6px;">--- E-TICKET KUPON ---</p>
        
        ${ticketsToPrint.map((ticket, i) => `
          <div class="ticket-box">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
              <p style="font-size:10px; color:#666; text-align: left;">Tiket #${i + 1}/${data.quantity}</p>
              <p style="font-size:10px; font-weight:bold; color:#000; text-align: right; max-width: 50%; word-break: break-word;">${data.buyerName}</p>
            </div>
            <p class="ticket-code">${ticket.code}</p>
            <div class="qr-container">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(ticket.code)}" 
                   alt="QR ${ticket.code}" 
                   width="120" height="120"
                   style="image-rendering: pixelated;" />
            </div>
            <p style="font-size:9px; color:#888;">Berlaku 1x penukaran kupon</p>
            ${ticket.isRedeemed ? '<p style="font-size:12px; font-weight:bold; color:red;">*** SUDAH DIGUNAKAN ***</p>' : ''}
          </div>
        `).join('')}
        
        <div class="separator"></div>
        
        <div class="footer">
          <p>Tunjukkan QR Code ini kepada panitia.</p>
          <p style="margin-top:6px;">Terima kasih!</p>
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
    setLoading(false);
  };

  return (
    <button
      onClick={handlePrint}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-xs font-bold shadow-sm"
      title="Cetak Struk Thermal"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Printer className="w-3.5 h-3.5" />
      )}
      Cetak
    </button>
  );
}
