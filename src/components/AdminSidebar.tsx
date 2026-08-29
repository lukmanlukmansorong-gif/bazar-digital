"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, Ticket, FileText, ScanLine, Settings, ShoppingBag, UserCheck, ShieldCheck, Users } from "lucide-react";
import type { UserSession } from "@/lib/auth";

const allLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, role: "admin" },
  { name: "Kasir Tunai (POS)", href: "/admin/kasir", icon: ShoppingBag, role: "admin" },
  { name: "Kupon & Stok", href: "/admin/kupon", icon: Ticket, role: "admin" },
  { name: "Transaksi", href: "/admin/transaksi", icon: FileText, role: "all" },
  { name: "Operator Online", href: "/admin/operator", icon: Users, role: "admin" },
  { name: "Scanner", href: "/admin/scanner", icon: ScanLine, role: "admin" },
  { name: "Pengaturan", href: "/admin/pengaturan", icon: Settings, role: "admin" },
];

export default function AdminSidebar({ session }: { session?: UserSession | null }) {
  const pathname = usePathname();
  const isOperator = session?.role === "operator";

  const links = allLinks.filter((link) => {
    if (isOperator) {
      return link.role === "all";
    }
    return true;
  });

  return (
    <div className="w-64 bg-card border-r h-[calc(100vh-4rem)] sticky top-16 hidden md:flex flex-col">
      <div className="p-6 pb-4">
        <h2 className="text-xl font-bold">Admin Portal</h2>
        
        {/* User Role & Name Badge */}
        <div className="mt-3 p-3 rounded-xl border bg-muted/40 flex items-center gap-2.5">
          {isOperator ? (
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate text-foreground">
              {isOperator ? (session?.name || `Operator: ${session?.username}`) : "Administrator"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {isOperator ? "Akses Pembelian Saja" : "Akses Penuh"}
            </p>
          </div>
        </div>
      </div>


      <nav className="flex-1 px-4 space-y-2 mt-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={async () => {
            await fetch('/api/admin/logout', { method: 'POST' });
            window.location.href = '/admin/login';
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </div>
  );
}

