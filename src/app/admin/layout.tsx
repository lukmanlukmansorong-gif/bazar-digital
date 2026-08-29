import AdminSidebar from "@/components/AdminSidebar";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar session={session} />
      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-muted/20">
        {children}
      </div>
    </div>
  );
}

