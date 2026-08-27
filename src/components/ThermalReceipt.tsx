"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";

interface TicketData {
  code: string;
  isRedeemed: boolean;
}

interface ReceiptData {
  transactionId: string;
  buyerName: string;
  buyerWa: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  eventName?: string;
  tickets: TicketData[];
}

export default function ThermalReceipt({ data }: { data: ReceiptData }) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      alert("Popup terblokir. Izinkan popup di browser Anda.");
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Struk Bazar Digital</title>
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
          .separator {
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .double-separator {
            border-top: 2px double #000;
            margin: 8px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            margin: 2px 0;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 2px;
          }
          .subtitle {
            font-size: 10px;
            color: #555;
          }
          .ticket-box {
            border: 1px dashed #000;
            padding: 8px;
            margin: 6px 0;
            text-align: center;
            page-break-inside: avoid;
          }
          .ticket-code {
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 1px;
            margin: 4px 0;
          }
          .qr-container {
            display: flex;
            justify-content: center;
            margin: 6px 0;
          }
          .footer {
            font-size: 9px;
            text-align: center;
            margin-top: 10px;
            color: #666;
          }
          @media print {
            body { width: 80mm; }
            @page {
              size: 80mm auto;
              margin: 0;
            }
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
          <span>${data.paymentMethod}</span>
        </div>
        
        <div class="separator"></div>
        
        <div class="row">
          <span>Jumlah Kupon</span>
          <span class="bold">${data.quantity} pcs</span>
        </div>
        <div class="row bold" style="font-size:14px; margin-top:4px;">
          <span>TOTAL</span>
          <span>Rp ${data.totalAmount.toLocaleString('id-ID')}</span>
        </div>
        
        <div class="double-separator"></div>
        
        <p class="center bold" style="margin-bottom:6px;">--- E-TICKET ---</p>
        
        ${data.tickets.map((ticket, i) => `
          <div class="ticket-box">
            <p style="font-size:10px; color:#666;">Tiket #${i + 1} dari ${data.quantity}</p>
            <p class="ticket-code">${ticket.code}</p>
            <div class="qr-container" id="qr-placeholder-${i}">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(ticket.code)}" 
                   alt="QR ${ticket.code}" 
                   width="120" height="120"
                   style="image-rendering: pixelated;" />
            </div>
            <p style="font-size:9px; color:#888;">Berlaku 1x penukaran</p>
            ${ticket.isRedeemed ? '<p style="font-size:12px; font-weight:bold; color:red;">*** SUDAH DIGUNAKAN ***</p>' : ''}
          </div>
        `).join('')}
        
        <div class="separator"></div>
        
        <div class="footer">
          <p>Tunjukkan QR Code ini</p>
          <p>kepada panitia saat acara.</p>
          <p style="margin-top:6px;">Terima kasih!</p>
          <p>Bazar Digital ${new Date().getFullYear()}</p>
        </div>
        
        <script>
          // Auto print when loaded
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors text-sm font-medium"
      title="Cetak Struk Thermal"
    >
      <Printer className="w-4 h-4" />
      Cetak
    </button>
  );
}
