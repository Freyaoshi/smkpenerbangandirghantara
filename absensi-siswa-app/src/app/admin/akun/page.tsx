"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserCog,
  Search,
  KeyRound,
  Ban,
  CheckCircle2,
  Filter,
  Loader2,
  Edit,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

interface AccountRow {
  id: string;
  username: string | null;
  name: string;
  appRole: string | null;
  banned: boolean | null;
}

const ALL_ROLES = [
  { value: "SUPER_ADMIN", label: "Super Administrator" },
  { value: "ADMIN", label: "Staf TU / Admin" },
  { value: "KEPALA_SEKOLAH", label: "Kepala Sekolah" },
  { value: "PETUGAS_PIKET", label: "Petugas Piket" },
  { value: "GURU", label: "Dewan Guru" },
  { value: "WALI_KELAS", label: "Wali Kelas" },
  { value: "GURU_BK", label: "Guru BK / Kesiswaan" },
  { value: "PEMBINA_EKSKUL", label: "Pembina Ekskul" },
  { value: "PUSTAKAWAN", label: "Pustakawan" },
  { value: "SARPRAS", label: "Pengelola Sarpras" },
  { value: "SISWA", label: "Siswa & Orang Tua" },
];

export default function AdminAkunPage() {
  const { data: session } = authClient.useSession();
  const currentRole = ((session?.user as Record<string, unknown>)?.appRole as string) || "";
  const isSuper = currentRole.toUpperCase() === "SUPER_ADMIN";

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Create User States
  const [createOpen, setCreateOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    username: "",
    password: "",
    targetRole: "GURU",
    email: "",
  });
  const [creating, setCreating] = useState(false);

  // Edit Profile States
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<AccountRow | null>(null);
  const [formEditName, setFormEditName] = useState("");
  const [formEditUsername, setFormEditUsername] = useState("");

  // Reset Password States
  const [resetOpen, setResetOpen] = useState(false);
  const [resetItem, setResetItem] = useState<AccountRow | null>(null);
  const [formNewPassword, setFormNewPassword] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/auth-accounts");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Gagal memuat data akun");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.username || !newForm.password || !newForm.targetRole) {
      toast.error("Mohon lengkapi semua kolom wajib");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/auth-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal membuat akun");
      }
      toast.success(`Akun baru (${newForm.name} - ${newForm.targetRole}) berhasil dibuat!`);
      setCreateOpen(false);
      setNewForm({
        name: "",
        username: "",
        password: "",
        targetRole: "GURU",
        email: "",
      });
      fetchData();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (account: AccountRow, setBanned: boolean) => {
    try {
      const res = await fetch(`/api/auth-accounts/${account.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: setBanned }),
      });
      if (!res.ok) throw new Error("Update gagal");
      toast.success(`Akun ${account.name} berhasil ${setBanned ? "dinonaktifkan" : "diaktifkan"}.`);
      fetchData();
    } catch {
      toast.error("Gagal mengubah status akun.");
    }
  };

  const openEdit = (acc: AccountRow) => {
    setEditItem(acc);
    setFormEditName(acc.name);
    setFormEditUsername(acc.username || "");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editItem || !formEditName) {
      toast.error("Nama wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/auth-accounts/${editItem.id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formEditName, username: formEditUsername }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      toast.success("Profil akun berhasil diperbarui!");
      setEditOpen(false);
      fetchData();
    } catch {
      toast.error("Gagal memperbarui profil akun");
    } finally {
      setSaving(false);
    }
  };

  const openReset = (acc: AccountRow) => {
    setResetItem(acc);
    setFormNewPassword("");
    setResetOpen(true);
  };

  const handleReset = async () => {
    if (!resetItem || !formNewPassword) {
      toast.error("Password baru wajib diisi");
      return;
    }
    if (formNewPassword.length < 4) {
      toast.error("Karakter password terlalu pendek (minimal 4 karakter)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/auth-accounts/${resetItem.id}/reset`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: formNewPassword }),
      });
      if (!res.ok) throw new Error("Gagal me-reset password");
      toast.success(`Password untuk ${resetItem.name} berhasil di-reset!`);
      setResetOpen(false);
    } catch {
      toast.error("Gagal me-reset password");
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeStyle = (role: string | null) => {
    switch (role?.toUpperCase()) {
      case "SUPER_ADMIN":
        return "bg-red-600 text-white font-bold";
      case "ADMIN":
        return "bg-navy-600 text-white font-medium";
      case "KEPALA_SEKOLAH":
        return "bg-purple-600 text-white font-medium";
      case "PETUGAS_PIKET":
        return "bg-blue-600 text-white";
      case "GURU":
        return "bg-amber-600 text-white";
      case "WALI_KELAS":
        return "bg-indigo-600 text-white";
      case "GURU_BK":
        return "bg-orange-600 text-white";
      case "PEMBINA_EKSKUL":
        return "bg-pink-600 text-white";
      case "PUSTAKAWAN":
        return "bg-emerald-600 text-white";
      case "SARPRAS":
        return "bg-teal-600 text-white";
      case "SISWA":
        return "bg-slate-700 text-white";
      default:
        return "bg-muted text-foreground";
    }
  };

  const filtered = accounts.filter((a) => {
    const searchLow = search.toLowerCase();
    const matchSearch =
      a.name?.toLowerCase().includes(searchLow) ||
      a.username?.toLowerCase().includes(searchLow);
    const matchRole =
      filterRole === "all" ||
      (a.appRole && a.appRole.toUpperCase() === filterRole.toUpperCase());
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Akun Pengguna"
        description="Kelola akun dan hak akses seluruh civitas akademika SMK Penerbangan Dirghantara (12 Role RBAC)."
        icon={UserCog}
      >
        {isSuper && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-navy-600 hover:bg-navy-700 text-white gap-2 shadow-sm">
                <UserPlus className="h-4 w-4" /> Tambah Akun Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreateUser}>
                <DialogHeader>
                  <DialogTitle>Buat Akun Pengguna Baru</DialogTitle>
                  <DialogDescription>
                    Pilih peran hak akses yang sesuai dengan tugas civitas sekolah.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="c-name">Nama Lengkap & Gelar</Label>
                    <Input
                      id="c-name"
                      placeholder="Contoh: Capt. Bambang Dirghantara, S.T."
                      value={newForm.name}
                      onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="c-username">Username / ID Login</Label>
                      <Input
                        id="c-username"
                        placeholder="NIP / NIS / username"
                        value={newForm.username}
                        onChange={(e) => setNewForm({ ...newForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="c-role">Peran (Role RBAC)</Label>
                      <Select
                        value={newForm.targetRole}
                        onValueChange={(val) => setNewForm({ ...newForm, targetRole: val || "" })}
                      >
                        <SelectTrigger id="c-role">
                          <SelectValue placeholder="Pilih Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {ALL_ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-pass">Kata Sandi Awal</Label>
                    <Input
                      id="c-pass"
                      type="text"
                      placeholder="Minimal 4 karakter"
                      value={newForm.password}
                      onChange={(e) => setNewForm({ ...newForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-email">Email (Opsional)</Label>
                    <Input
                      id="c-email"
                      type="email"
                      placeholder="user@dirghantara.sch.id"
                      value={newForm.email}
                      onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={creating} className="bg-navy-600 hover:bg-navy-700">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
                    Buat Akun
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </PageHeader>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau username pengguna..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterRole} onValueChange={(val) => setFilterRole(val || "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role ({accounts.length})</SelectItem>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 pl-6">No</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Nama Pengguna</TableHead>
                  <TableHead>Role RBAC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a, i) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-6 text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-mono text-sm">{a.username || "-"}</TableCell>
                    <TableCell className="font-medium text-navy-950">{a.name}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeStyle(a.appRole)}>
                        {a.appRole || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          !a.banned
                            ? "bg-emerald-100 text-emerald-800 border-none"
                            : "bg-red-100 text-red-800 border-none"
                        }
                      >
                        {!a.banned ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 h-8 text-xs text-navy-600 hover:bg-navy-50"
                          onClick={() => openEdit(a)}
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 h-8 text-xs text-amber-600 hover:bg-amber-50"
                          onClick={() => openReset(a)}
                        >
                          <KeyRound className="h-3.5 w-3.5" /> Reset Sandi
                        </Button>
                        {!a.banned ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 h-8 text-xs text-red-500 hover:bg-red-50"
                            onClick={() => toggleStatus(a, true)}
                          >
                            <Ban className="h-3.5 w-3.5" /> Suspend
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 h-8 text-xs text-emerald-600 hover:bg-emerald-50"
                            onClick={() => toggleStatus(a, false)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Aktifkan
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Edit Profile */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profil Akun</DialogTitle>
            <DialogDescription>Perbarui nama dan username akses dari akun ini</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={formEditName}
                onChange={(e) => setFormEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username (Opsional)</Label>
              <Input
                id="edit-username"
                placeholder="Masukkan username"
                value={formEditUsername}
                onChange={(e) => setFormEditUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Username digunakan untuk login bersamaan dengan password.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Batal
            </Button>
            <Button className="bg-navy-600 hover:bg-navy-700" onClick={handleEdit} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reset Password */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Kata Sandi</DialogTitle>
            <DialogDescription>
              Ubah kata sandi untuk akun <span className="font-semibold">{resetItem?.name}</span> secara paksa
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 space-y-2">
              <p className="text-sm font-medium text-blue-800">Informasi Sandi Pengguna</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-700">Sandi Bawaan (Default):</span>
                <code className="rounded bg-white px-2 py-0.5 text-sm font-bold text-blue-900 border border-blue-200">
                  {resetItem?.username || "-"}
                </code>
              </div>
              <p className="text-[11px] text-blue-600">
                Sandi bawaan pengguna biasanya = Username mereka. Setelah direset, beritahukan kata sandi baru kepada pemilik akun.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input
                id="new-password"
                type="text"
                placeholder="Masukkan password baru"
                value={formNewPassword}
                onChange={(e) => setFormNewPassword(e.target.value)}
                className="font-mono bg-amber-50"
              />
              <p className="text-xs text-amber-600 mt-1">
                Sandi ini akan menggantikan sandi lama mereka. Segera beritahu pengguna mengenai sandi barunya.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Batal
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleReset} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Sandi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
