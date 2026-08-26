import prisma from "@/lib/db";
import { Ticket, DollarSign, Clock } from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboard() {
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  
  const [
    waitingVerification,
    revenueAgg
  ] = await Promise.all([
    prisma.transaction.count({ where: { status: "WAITING_VERIFICATION" } }),
    prisma.transaction.aggregate({
      where: { status: "VERIFIED" },
      _sum: { totalAmount: true }
    })
  ]);

  const totalRevenue = revenueAgg._sum.totalAmount || 0;
  const stockLeft = (config?.totalCoupons || 0) - (config?.couponsSold || 0);

  const stats = [
    { title: "Total Pendapatan", value: `Rp ${totalRevenue.toLocaleString('id-ID')}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-100" },
    { title: "Kupon Terjual", value: config?.couponsSold || 0, icon: Ticket, color: "text-blue-500", bg: "bg-blue-100" },
    { title: "Kupon Tersedia", value: stockLeft, icon: Ticket, color: "text-purple-500", bg: "bg-purple-100" },
    { title: "Menunggu Verifikasi", value: waitingVerification, icon: Clock, color: "text-orange-500", bg: "bg-orange-100" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-card p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-2xl border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Informasi Bazar</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Nama Event</span>
              <span className="font-medium">{config?.eventName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Harga Kupon</span>
              <span className="font-medium">Rp {(config?.couponPrice || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Total Kupon Sistem</span>
              <span className="font-medium">{config?.totalCoupons}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">Status Penjualan</span>
              <span className={`font-bold ${config?.isOpen ? 'text-green-500' : 'text-red-500'}`}>
                {config?.isOpen ? 'BUKA' : 'TUTUP'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
