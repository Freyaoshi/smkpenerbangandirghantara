"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  PlusCircle,
  Search,
  Calendar,
  AlertCircle,
  Trash2,
  CheckCircle,
  Loader2,
  RefreshCw,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminMadingPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog Form
  const [openDialog, setOpenDialog] = useState(false);
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("Agenda Sekolah");
  const [konten, setKonten] = useState("");
  const [prioritas, setPrioritas] = useState("Normal");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    } catch {
      toast.error("Gagal memuat mading");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !konten) {
      toast.error("Judul dan isi pengumuman wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          kategori,
          konten,
          prioritas,
        }),
      });

      if (res.ok) {
        toast.success("Pengumuman berhasil dipublikasikan!");
        setOpenDialog(false);
        setJudul("");
        setKonten("");
        fetchAnnouncements();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal mempublikasikan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Pengumuman berhasil dihapus");
        fetchAnnouncements();
      }
    } catch {
      toast.error("Gagal menghapus pengumuman");
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.konten.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2.5 backdrop-blur-md">
              <Megaphone className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Mading & Pengumuman Sekolah Digital (Modul G)
              </h1>
              <p className="text-xs text-navy-200">
                Pusat publikasi informasi resmi, jadwal apel kedirgantaraan, surat edaran, dan prestasi siswa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAnnouncements}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Segarkan
            </Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger render={
                <Button size="sm" className="bg-amber-500 text-navy-950 hover:bg-amber-400 font-semibold">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Pengumuman Baru
                </Button>
              }>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Publikasi Pengumuman Mading</DialogTitle>
                  <DialogDescription className="text-xs">
                    Pengumuman ini dapat dibaca oleh seluruh warga sekolah (Dewan Guru, Siswa, dan Staf)
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Judul Pengumuman</Label>
                    <Input
                      placeholder="Contoh: Apel Akbar Hari Kedirgantaraan..."
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Kategori</Label>
                      <select
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        <option value="Agenda Sekolah">Agenda Sekolah</option>
                        <option value="Apel Kedirgantaraan">Apel Kedirgantaraan</option>
                        <option value="Surat Edaran">Surat Edaran</option>
                        <option value="Prestasi Siswa">Prestasi Siswa</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Tingkat Prioritas</Label>
                      <select
                        value={prioritas}
                        onChange={(e) => setPrioritas(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Penting">Penting</option>
                        <option value="Urgent">Mendesak / Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Konten Informasi</Label>
                    <Textarea
                      placeholder="Tuliskan isi pengumuman secara rinci..."
                      rows={5}
                      value={konten}
                      onChange={(e) => setKonten(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-navy-700 text-white">
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Publikasikan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari pengumuman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Announcements Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="border-border/60 shadow-md hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={
                    item.kategori.includes("Apel")
                      ? "border-amber-500 text-amber-700 bg-amber-50"
                      : item.kategori.includes("Prestasi")
                      ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                      : "border-navy-300 text-navy-800 bg-navy-50"
                  }
                >
                  {item.kategori}
                </Badge>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      item.prioritas === "Urgent"
                        ? "bg-red-600 text-white text-[10px]"
                        : item.prioritas === "Penting"
                        ? "bg-amber-600 text-white text-[10px]"
                        : "bg-slate-200 text-slate-700 text-[10px]"
                    }
                  >
                    {item.prioritas}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-base font-semibold mt-2">{item.judul}</CardTitle>
              <CardDescription className="text-[11px]">
                Dipublikasikan oleh {item.authorName} • {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed">
                {item.konten}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
