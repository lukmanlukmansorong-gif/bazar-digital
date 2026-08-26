import Link from 'next/link';
import { Ticket, Search, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Ticket className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl tracking-tight text-primary">Bazar Digital</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/cek-pesanan" className="text-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Cek Pesanan</span>
            </Link>
            <Link href="/admin/login" className="text-foreground hover:text-primary transition-colors flex items-center gap-1 text-sm font-medium">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
