"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  HeartHandshake,
  ShieldAlert,
  PlusCircle,
  Search,
  Filter,
  User,
  CheckCircle,
  FileText,
  Lock,
  Loader2,
  RefreshCw,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function BukuSakuDanBKPage() {
  const { data: session } = authClient.useSession();
  const appRole = ((session?.user as Record<string, unknown>)?.appRole as string | undefined)?.toUpperCase();
  const isBKorSuperAdmin = appRole === "GURU_BK" || appRole === "SUPER_ADMIN";

  const [loading, setLoading] = useState(true);
  const [violations, setViolations] = useState<any[]>([]);
  const [studentSummary, setStudentSummary] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [counselingRecords, setCounselingRecords] = useState<any[]>([]);

  // Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("all");

  // Form New Violation
  const [openViolationDialog, setOpenViolationDialog] = useState(false);
  const [vStudentId, setVStudentId] = useState("");
  const [vNamaPelanggaran, setVNamaPelanggaran] = useState("");
  const [vKategori, setVKategori] = useState("Ringan");
  const [vPoin, setVPoin] = useState(5);
  const [vTindakan, setVTindakan] = useState("");
  const [vSanksi, setVSanksi] = useState("");
  const [submittingV, setSubmittingV] = useState(false);

  // Form New Counseling
  const [openCounselingDialog, setOpenCounselingDialog] = useState(false);
  const [cStudentId, setCStudentId] = useState("");
  const [cJenis, setCJenis] = useState("Pribadi");
  const [cMasalah, setCMasalah] = useState("");
  const [cTindakLanjut, setCTindakLanjut] = useState("");
  const [cRahasia, setCRahasia] = useState("");
  const [submittingC, setSubmittingC] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resDisc = await fetch("/api/discipline");
      if (resDisc.ok) {
        const dData = await resDisc.json();
        setViolations(dData.violations || []);
        setStudentSummary(dData.studentSummary || []);
        setAllStudents(dData.allStudents || []);
      }

      if (isBKorSuperAdmin) {
        const resC = await fetch("/api/counseling");
        if (resC.ok) {
          const cData = await resC.json();
          setCounselingRecords(Array.isArray(cData) ? cData : []);
        }
      }
    } catch {
      toast.error("Gagal memuat data kedisiplinan");
    } finally {
      setLoading(false);
    }
  };

  const handleAddViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingV(true);
    try {
      const res = await fetch("/api/discipline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: vStudentId,
          namaPelanggaran: vNamaPelanggaran,
          kategori: vKategori,
          poin: vPoin,
          tindakan: vTindakan,
          sanksi: vSanksi,
        }),
      });
      if (res.ok) {
        toast.success("Catatan pelanggaran berhasil disimpan!");
        setOpenViolationDialog(false);
        setVNamaPelanggaran("");
        setVTindakan("");
        setVSanksi("");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmittingV(false);
    }
  };

  const handleAddCounseling = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingC(true);
    try {
      const res = await fetch("/api/counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: cStudentId,
          jenisBimbingan: cJenis,
          ringkasanMasalah: cMasalah,
          tindakLanjut: cTindakLanjut,
          catatanRahasia: cRahasia,
        }),
      });
      if (res.ok) {
        toast.success("Sesi konseling berhasil direkam");
        setOpenCounselingDialog(false);
        setCMasalah("");
        setCTindakLanjut("");
        setCRahasia("");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal merekam sesi konseling");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmittingC(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const filteredViolations = violations.filter(
    (v) =>
      v.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.namaPelanggaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.nis.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2.5 backdrop-blur-md">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Buku Saku Digital Kedisiplinan & Bimbingan Konseling
              </h1>
              <p className="text-xs text-navy-200">
                Pencatatan pelanggaran siswa, pemantauan poin SP, dan integrasi kriteria C3 SPK SMART
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Segarkan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="buku-saku" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="buku-saku">Buku Saku Pelanggaran</TabsTrigger>
          <TabsTrigger value="konseling">Bimbingan Konseling (BK)</TabsTrigger>
        </TabsList>

        {/* Tab 1: Buku Saku Pelanggaran */}
        <TabsContent value="buku-saku" className="space-y-6">
          {/* Action and Threshold Alerts */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-border/60 shadow-sm">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground font-medium">Batas Surat Peringatan I</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold text-amber-600">30 Poin</span>
                  <Badge variant="outline" className="text-[10px]">SP 1</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground font-medium">Batas Surat Peringatan II</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold text-orange-600">55 Poin</span>
                  <Badge variant="outline" className="text-[10px]">SP 2</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground font-medium">Batas Surat Peringatan III</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold text-red-600">75 Poin</span>
                  <Badge variant="outline" className="text-[10px]">SP 3</Badge>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm">
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground font-medium">Sidang Pleno / Ortu</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold text-rose-700">100 Poin</span>
                  <Badge className="bg-rose-700 text-white text-[10px]">Pleno</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Dialog & Filter Bar */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari siswa, NIS, atau jenis pelanggaran..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <Dialog open={openViolationDialog} onOpenChange={setOpenViolationDialog}>
                  <DialogTrigger render={
                    <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-700">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Catat Kasus Pelanggaran
                    </Button>
                  }>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Input Pelanggaran Buku Saku</DialogTitle>
                      <DialogDescription className="text-xs">
                        Catatan ini akan otomatis mengakumulasi poin siswa dan mengurangi skor C3 Kedisiplinan pada SPK SMART.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddViolation} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Pilih Siswa</Label>
                        <select
                          value={vStudentId}
                          onChange={(e) => setVStudentId(e.target.value)}
                          required
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                        >
                          <option value="">-- Pilih Siswa --</option>
                          {allStudents.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.namaLengkap} ({s.nis} - {s.kelas})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Kategori</Label>
                          <select
                            value={vKategori}
                            onChange={(e) => {
                              const kat = e.target.value;
                              setVKategori(kat);
                              if (kat === "Ringan") setVPoin(5);
                              else if (kat === "Sedang") setVPoin(15);
                              else setVPoin(50);
                            }}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                          >
                            <option value="Ringan">Ringan (5-10 poin)</option>
                            <option value="Sedang">Sedang (15-25 poin)</option>
                            <option value="Berat">Berat (50-100 poin)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Poin Pelanggaran</Label>
                          <Input
                            type="number"
                            value={vPoin}
                            onChange={(e) => setVPoin(parseInt(e.target.value))}
                            required
                            className="text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Nama / Deskripsi Pelanggaran</Label>
                        <Input
                          placeholder="Contoh: Tidak mengenakan atribut PDH lengkap / Terlambat apel"
                          value={vNamaPelanggaran}
                          onChange={(e) => setVNamaPelanggaran(e.target.value)}
                          required
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Tindakan Pembinaan</Label>
                        <Input
                          placeholder="Contoh: Teguran lisan, pembersihan bengkel"
                          value={vTindakan}
                          onChange={(e) => setVTindakan(e.target.value)}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Sanksi yang Diberikan</Label>
                        <Input
                          placeholder="Contoh: Pembinaan fisik terukur / Tugas resume"
                          value={vSanksi}
                          onChange={(e) => setVSanksi(e.target.value)}
                          className="text-xs"
                        />
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpenViolationDialog(false)}>
                          Batal
                        </Button>
                        <Button type="submit" disabled={submittingV} className="bg-amber-600 text-white">
                          {submittingV ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Simpan Pelanggaran
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Table of Violations */}
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Riwayat Kasus Pelanggaran Siswa</CardTitle>
              <CardDescription className="text-xs">
                Menampilkan {filteredViolations.length} catatan pelanggaran kedisiplinan aktif
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredViolations.length === 0 ? (
                <div className="flex h-36 flex-col items-center justify-center text-muted-foreground text-xs">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                  <p>Tidak ada catatan pelanggaran siswa yang ditemukan.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 text-xs">
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Nama Siswa & Kelas</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Poin</TableHead>
                        <TableHead>Pelanggaran</TableHead>
                        <TableHead>Tindakan / Sanksi</TableHead>
                        <TableHead>Status SP</TableHead>
                        <TableHead>Pelapor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredViolations.map((v) => (
                        <TableRow key={v.id} className="text-xs">
                          <TableCell className="font-mono text-muted-foreground">{v.tanggal}</TableCell>
                          <TableCell>
                            <p className="font-semibold text-foreground">{v.namaSiswa}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {v.nis} • {v.kelas}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                v.kategori === "Ringan"
                                  ? "border-emerald-500 text-emerald-600"
                                  : v.kategori === "Sedang"
                                  ? "border-amber-500 text-amber-600"
                                  : "border-red-500 text-red-600"
                              }
                            >
                              {v.kategori}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-red-600">+{v.poin}</TableCell>
                          <TableCell className="font-medium">{v.namaPelanggaran}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {v.tindakan || "-"} {v.sanksi ? `(${v.sanksi})` : ""}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                v.statusSP === "None"
                                  ? "bg-slate-100 text-slate-700"
                                  : v.statusSP === "SP 1"
                                  ? "bg-amber-600 text-white"
                                  : v.statusSP === "SP 2"
                                  ? "bg-orange-600 text-white"
                                  : "bg-red-600 text-white"
                              }
                            >
                              {v.statusSP}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{v.reportedBy || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Bimbingan Konseling (Rahasia) */}
        <TabsContent value="konseling" className="space-y-6">
          <Card className="border-border/60 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">Rekam Jejak Konseling Siswa (Modul L)</CardTitle>
                  <Badge variant="outline" className="border-rose-400 text-rose-600 flex items-center gap-1 text-[10px]">
                    <Lock className="h-3 w-3" /> Rahasia BK
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Sesuai Modul L-03 PRD: Data sesi konseling terjaga kerahasiaannya dan hanya dapat diakses oleh Guru BK
                </CardDescription>
              </div>

              {isBKorSuperAdmin && (
                <Dialog open={openCounselingDialog} onOpenChange={setOpenCounselingDialog}>
                  <DialogTrigger render={
                    <Button size="sm" className="bg-navy-700 text-white hover:bg-navy-800">
                      <HeartHandshake className="mr-2 h-4 w-4" />
                      Catat Sesi Konseling
                    </Button>
                  }>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Sesi Bimbingan Konseling Baru</DialogTitle>
                      <DialogDescription className="text-xs">
                        Rekam tindak lanjut penanganan masalah dan perkembangan kepribadian siswa
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddCounseling} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Pilih Siswa</Label>
                        <select
                          value={cStudentId}
                          onChange={(e) => setCStudentId(e.target.value)}
                          required
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                        >
                          <option value="">-- Pilih Siswa --</option>
                          {allStudents.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.namaLengkap} ({s.nis} - {s.kelas})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Jenis Bimbingan</Label>
                        <select
                          value={cJenis}
                          onChange={(e) => setCJenis(e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                        >
                          <option value="Pribadi">Pribadi / Emosional</option>
                          <option value="Sosial">Sosial / Hubungan Teman</option>
                          <option value="Belajar">Belajar / Kesulitan Akademik</option>
                          <option value="Karir / Kedirgantaraan">Karir Kedirgantaraan / Prakerin</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Ringkasan Masalah</Label>
                        <Textarea
                          placeholder="Uraikan keluhan atau permasalahan yang dibahas..."
                          rows={3}
                          value={cMasalah}
                          onChange={(e) => setCMasalah(e.target.value)}
                          required
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Tindak Lanjut & Kesepakatan</Label>
                        <Input
                          placeholder="Contoh: Monitoring mingguan, tugas komitmen kehadiran"
                          value={cTindakLanjut}
                          onChange={(e) => setCTindakLanjut(e.target.value)}
                          className="text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Catatan Rahasia Konselor</Label>
                        <Textarea
                          placeholder="Catatan psikologis privat konselor..."
                          rows={2}
                          value={cRahasia}
                          onChange={(e) => setCRahasia(e.target.value)}
                          className="text-xs font-mono"
                        />
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpenCounselingDialog(false)}>
                          Batal
                        </Button>
                        <Button type="submit" disabled={submittingC} className="bg-navy-700 text-white">
                          {submittingC ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Simpan Catatan
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {!isBKorSuperAdmin ? (
                <div className="flex h-36 flex-col items-center justify-center text-muted-foreground text-xs">
                  <Lock className="h-8 w-8 text-rose-500 mb-2" />
                  <p>Akses Terbatas: Hanya Guru Bimbingan Konseling yang dapat membuka rekam jejak ini.</p>
                </div>
              ) : counselingRecords.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Belum ada sesi bimbingan konseling yang tercatat.
                </p>
              ) : (
                <div className="space-y-3">
                  {counselingRecords.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-foreground">{c.namaSiswa}</span>
                          <span className="text-muted-foreground ml-2">({c.nis} - {c.kelas})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{c.jenisBimbingan}</Badge>
                          <Badge className="bg-emerald-600 text-white text-[10px]">{c.status}</Badge>
                        </div>
                      </div>
                      <p className="text-foreground/90">
                        <strong>Masalah:</strong> {c.ringkasanMasalah}
                      </p>
                      {c.tindakLanjut && (
                        <p className="text-muted-foreground">
                          <strong>Tindak Lanjut:</strong> {c.tindakLanjut}
                        </p>
                      )}
                      {c.catatanRahasia && (
                        <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-rose-900 font-mono text-[11px]">
                          <strong>Catatan Khusus:</strong> {c.catatanRahasia}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
