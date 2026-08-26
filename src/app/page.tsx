import Link from "next/link";
import prisma from "@/lib/db";
import { ArrowRight, ShoppingCart, CheckCircle, CreditCard, Ticket as TicketIcon } from "lucide-react";

export const revalidate = 0; // Disable caching for real-time status

export default async function Home() {
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  
  if (!config) {
    return <div className="p-8 text-center">Config not found. Please run seed.</div>;
  }

  const stockLeft = config.totalCoupons - config.couponsSold;
  const isAvailable = config.isOpen && stockLeft > 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 sm:py-32">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-float">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAvailable ? 'bg-accent' : 'bg-destructive'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isAvailable ? 'bg-accent' : 'bg-destructive'}`}></span>
            </span>
            <span className="font-semibold text-sm">
              {config.isOpen ? (stockLeft > 0 ? `Bazar Dibuka - Sisa ${stockLeft} Kupon` : 'Stok Habis') : 'Bazar Ditutup'}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            {config.eventName}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Dapatkan kupon bazar digital Anda sekarang. Nikmati kemudahan bertransaksi tanpa antre dengan e-ticket berteknologi QR Code.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="glass-dark sm:glass p-6 rounded-2xl w-full sm:w-auto text-center sm:text-left flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Harga Spesial</p>
                <p className="text-4xl font-bold text-foreground">Rp {config.couponPrice.toLocaleString('id-ID')}<span className="text-lg text-muted-foreground font-normal">/Kupon</span></p>
              </div>
              <Link
                href={isAvailable ? "/beli" : "#"}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                  isAvailable 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg shadow-primary/30" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {isAvailable ? "Beli Kupon Sekarang" : "Penjualan Ditutup"}
                {isAvailable && <ArrowRight className="w-5 h-5" />}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Cara Membeli Kupon</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">4 langkah mudah untuk mendapatkan e-ticket Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: ShoppingCart, title: "1. Pilih Kupon", desc: "Tentukan jumlah kupon yang ingin dibeli & isi data diri." },
              { icon: CreditCard, title: "2. Pembayaran", desc: "Bayar mudah dengan QRIS atau Transfer Bank." },
              { icon: CheckCircle, title: "3. Verifikasi", desc: "Upload bukti transfer & tunggu verifikasi panitia (instan untuk QRIS)." },
              { icon: TicketIcon, title: "4. Dapatkan E-Ticket", desc: "E-Ticket dengan QR Code siap diunduh & digunakan!" },
            ].map((step, i) => (
              <div key={i} className="relative p-6 bg-background rounded-2xl border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
