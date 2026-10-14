"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Clock,
  MapPin,
  Camera,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function PiketControlBoardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    tanggal: string;
    totalHadir: number;
    totalTerlambat: number;
    records: any[];
    allTeachers: any[];
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal manual verification
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [manualStatus, setManualStatus] = useState("Hadir");
  const [manualAlasan, setManualAlasan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPiketData();
  }, []);

  const fetchPiketData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher-attendance");
      if (res.ok) {
        setData(await res.json());
      } else {
        toast.error("Gagal memuat papan kontrol piket");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      toast.error("Pilih guru terlebih dahulu");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/teacher-attendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          status: manualStatus,
          alasanPiket: manualAlasan || "Verifikasi manual oleh Petugas Piket",
        }),
      });
      if (res.ok) {
        toast.success("Verifikasi manual berhasil disimpan");
        setDialogOpen(false);
        setManualAlasan("");
        fetchPiketData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal verifikasi");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Combine teachers list to see who has attended vs who hasn't
  const recordsMap = new Map((data?.records || []).map((r: any) => [r.teacherId, r]));
  const fullList = (data?.allTeachers || []).map((t: any) => {
    const rec = recordsMap.get(t.id);
    return {
      teacherId: t.id,
      nama: t.namaLengkap,
      nip: t.nip,
      jabatan: t.jabatan || "Guru Kejuruan",
      status: rec ? rec.status : "Belum Absen",
      jamMasuk: rec ? rec.jamMasuk : "-",
      metode: rec ? rec.metode : "-",
      jarakMeter: rec ? rec.jarakMeter : null,
      catatan: rec ? rec.catatan : "-",
    };
  });

  const filteredTeachers = fullList.filter(
    (t: any) =>
      t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-blue-950 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/20 p-2.5 backdrop-blur-md">
              <UserCheck className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Papan Kontrol Presensi Guru & Petugas Piket (Modul C)
              </h1>
              <p className="text-xs text-navy-200">
                Monitoring real-time kehadiran dewan guru dan verifikasi alternatif manual piket
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchPiketData}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Segarkan
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={
                <Button size="sm" className="bg-amber-500 text-navy-950 hover:bg-amber-400 font-semibold">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Verifikasi Manual
                </Button>
              }>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Verifikasi Manual Petugas Piket</DialogTitle>
                  <DialogDescription className="text-xs">
                    Gunakan verifikasi ini untuk guru yang hadir tetapi mengalami kendala teknis (kamera HP/laptop rusak atau GPS tidak terbaca).
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleManualVerify} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Pilih Dewan Guru</Label>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="">-- Pilih Guru --</option>
                      {data?.allTeachers?.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.namaLengkap} ({t.nip})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Status Kehadiran</Label>
                    <select
                      value={manualStatus}
                      onChange={(e) => setManualStatus(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="Hadir">Hadir</option>
                      <option value="Terlambat">Terlambat</option>
                      <option value="Izin">Izin (Dinas Luar / Seminar)</option>
                      <option value="Sakit">Sakit</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Keterangan / Alasan Piket</Label>
                    <Input
                      placeholder="Contoh: Kendala kamera ponsel, konfirmasi fisik hadir di hanggar"
                      value={manualAlasan}
                      onChange={(e) => setManualAlasan(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-navy-700 text-white">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Simpan Verifikasi
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Hadir</p>
              <h2 className="text-2xl font-bold text-emerald-600 mt-1">{data?.totalHadir || 0} Guru</h2>
            </div>
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Terlambat</p>
              <h2 className="text-2xl font-bold text-amber-600 mt-1">{data?.totalTerlambat || 0} Guru</h2>
            </div>
            <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Belum Absen / Lainnya</p>
              <h2 className="text-2xl font-bold text-slate-600 mt-1">
                {(data?.allTeachers?.length || 0) - (data?.totalHadir || 0)} Guru
              </h2>
            </div>
            <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
              <AlertCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-border/60 shadow-md">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Tabel Presensi Pendidik Hari Ini</CardTitle>
              <CardDescription className="text-xs">
                Tanggal: {data?.tanggal || new Date().toISOString().split("T")[0]}
              </CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari guru atau NIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs">Nama Guru & NIP</TableHead>
                  <TableHead className="text-xs">Jabatan</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Jam Masuk</TableHead>
                  <TableHead className="text-xs">Metode</TableHead>
                  <TableHead className="text-xs">Jarak GPS</TableHead>
                  <TableHead className="text-xs">Catatan / Validasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((t: any) => (
                  <TableRow key={t.teacherId} className="text-xs">
                    <TableCell>
                      <p className="font-semibold text-foreground">{t.nama}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">NIP: {t.nip}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t.jabatan}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          t.status === "Hadir"
                            ? "bg-emerald-600 text-white"
                            : t.status === "Terlambat"
                            ? "bg-amber-600 text-white"
                            : t.status === "Izin" || t.status === "Sakit"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{t.jamMasuk}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        {t.metode.includes("Biometrik") ? (
                          <Camera className="h-3.5 w-3.5 text-navy-600" />
                        ) : null}
                        {t.metode}
                      </span>
                    </TableCell>
                    <TableCell>
                      {t.jarakMeter !== null ? (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          {t.jarakMeter}m
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{t.catatan}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
