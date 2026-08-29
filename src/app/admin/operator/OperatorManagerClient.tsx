"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  UserPlus, 
  Users, 
  UserCheck, 
  UserX, 
  KeyRound, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { 
  createOperator, 
  updateOperator, 
  toggleOperatorStatus, 
  deleteOperator 
} from "./actions";

interface Operator {
  id: string;
  name: string;
  username: string;
  password?: string;
  isActive: boolean;
  createdAt: string | Date;
}

export default function OperatorManagerClient({ 
  initialOperators 
}: { 
  initialOperators: Operator[] 
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filteredOperators = initialOperators.filter((op) =>
    op.name.toLowerCase().includes(search.toLowerCase()) ||
    op.username.toLowerCase().includes(search.toLowerCase())
  );

  const totalCount = initialOperators.length;
  const activeCount = initialOperators.filter(o => o.isActive).length;
  const inactiveCount = totalCount - activeCount;

  const showNotification = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMsg(message);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(message);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createOperator(formData);

    setLoading(false);
    if (res.success) {
      setIsAddModalOpen(false);
      showNotification("success", "Operator baru berhasil ditambahkan!");
      router.refresh();
    } else {
      showNotification("error", res.error || "Gagal menambahkan operator.");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingOperator) return;
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.append("id", editingOperator.id);
    const res = await updateOperator(formData);

    setLoading(false);
    if (res.success) {
      setEditingOperator(null);
      showNotification("success", `Data operator ${editingOperator.username} berhasil diperbarui!`);
      router.refresh();
    } else {
      showNotification("error", res.error || "Gagal memperbarui operator.");
    }
  };

  const handleToggle = async (op: Operator) => {
    const nextStatus = !op.isActive;
    const confirmMsg = nextStatus 
      ? `Aktifkan kembali akun operator '${op.name}' (${op.username})?`
      : `Nonaktifkan akun operator '${op.name}' (${op.username})?\nOperator ini tidak akan bisa login lagi sebelum diaktifkan.`;
    
    if (!confirm(confirmMsg)) return;

    setActionId(op.id);
    const res = await toggleOperatorStatus(op.id, op.isActive);
    setActionId(null);

    if (res.success) {
      showNotification("success", `Status operator '${op.username}' berhasil diubah.`);
      router.refresh();
    } else {
      showNotification("error", res.error || "Gagal mengubah status.");
    }
  };

  const handleDelete = async (op: Operator) => {
    const confirmDelete = confirm(
      `⚠️ HAPUS AKUN OPERATOR?\n\n` +
      `Nama: ${op.name}\n` +
      `Username: ${op.username}\n\n` +
      `Apakah Anda yakin ingin menghapus akun operator ini secara permanen?`
    );

    if (!confirmDelete) return;

    setActionId(op.id);
    const res = await deleteOperator(op.id);
    setActionId(null);

    if (res.success) {
      showNotification("success", `Operator '${op.username}' berhasil dihapus.`);
      router.refresh();
    } else {
      showNotification("error", res.error || "Gagal menghapus operator.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Operator</p>
            <p className="text-3xl font-black mt-1 text-foreground">{totalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Operator Aktif</p>
            <p className="text-3xl font-black mt-1 text-emerald-600">{activeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Nonaktif</p>
            <p className="text-3xl font-black mt-1 text-gray-500">{inactiveCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-card p-4 rounded-2xl border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau username operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Operator Baru
        </button>
      </div>

      {/* Operators Table */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="p-4">Operator</th>
              <th className="p-4">Username Login</th>
              <th className="p-4">Status Akun</th>
              <th className="p-4">Terdaftar Sejak</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filteredOperators.map((op) => (
              <tr key={op.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      {op.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{op.name}</p>
                      <p className="text-xs text-muted-foreground">Operator Penjualan Online</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-mono text-xs bg-muted px-2.5 py-1 rounded-md font-semibold text-foreground">
                    @{op.username}
                  </span>
                </td>
                <td className="p-4">
                  {op.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      Nonaktif
                    </span>
                  )}
                </td>
                <td className="p-4 text-muted-foreground text-xs">
                  {new Date(op.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Toggle Status Button */}
                    <button
                      onClick={() => handleToggle(op)}
                      disabled={actionId === op.id}
                      title={op.isActive ? "Nonaktifkan Akses" : "Aktifkan Akses"}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        op.isActive
                          ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {op.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>

                    {/* Edit / Change Password Button */}
                    <button
                      onClick={() => setEditingOperator(op)}
                      disabled={actionId === op.id}
                      title="Ubah Nama / Reset Sandi"
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(op)}
                      disabled={actionId === op.id}
                      title="Hapus Operator"
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredOperators.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="font-medium">Belum ada akun operator.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Klik tombol <strong>&quot;Tambah Operator Baru&quot;</strong> di atas untuk membuat akun operator pertama.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Tambah Operator Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Tambah Operator Baru</h3>
                <p className="text-xs text-muted-foreground">Akun khusus staf/petugas pantau penjualan online</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Nama Lengkap Petugas</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Contoh: Siti Rahmawati / Kasir Online 1"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Username Login</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Contoh: siti / kasir1 (tanpa spasi)"
                  required
                  pattern="[a-zA-Z0-9_\-]+"
                  title="Gunakan huruf, angka, underscore atau tanda hubung"
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">Username digunakan saat login ke portal.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Password Login</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimal 4 karakter"
                  required
                  minLength={4}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl font-semibold text-sm hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all text-sm disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Operator"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Operator / Reset Password */}
      {editingOperator && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setEditingOperator(null)}
              className="absolute right-5 top-5 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Edit Akun Operator</h3>
                <p className="text-xs text-muted-foreground">Username: <strong>@{editingOperator.username}</strong></p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Nama Petugas</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingOperator.name}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Reset Password Baru</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Kosongkan jika password tidak diubah"
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">Isi hanya jika operator lupa kata sandi.</p>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingOperator(null)}
                  className="flex-1 py-2.5 border rounded-xl font-semibold text-sm hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all text-sm disabled:opacity-50"
                >
                  {loading ? "Memperbarui..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
