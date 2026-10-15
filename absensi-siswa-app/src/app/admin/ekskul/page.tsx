"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Trophy,
  Users,
  Search,
  PlusCircle,
  Edit2,
  CheckCircle,
  Loader2,
  RefreshCw,
  Sparkles,
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

export default function EkskulPrestasiPage() {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog Form
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [namaEkskul, setNamaEkskul] = useState("Aero Modeling");
  const [nilaiKeaktifan, setNilaiKeaktifan] = useState(85);
  const [prestasiNama, setPrestasiNama] = useState("");
  const [nilaiPrestasi, setNilaiPrestasi] = useState(75);
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resEkskul, resStudents] = await Promise.all([
        fetch("/api/ekskul"),
        fetch("/api/students"),
      ]);

      if (resEkskul.ok) {
        const eData = await resEkskul.json();
        setScores(Array.isArray(eData) ? eData : []);
      }
      if (resStudents.ok) {
        const sData = await resStudents.json();
        setAllStudents(Array.isArray(sData) ? sData : []);
      }
    } catch {
      toast.error("Gagal memuat data ekskul dan prestasi");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ekskul", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          namaEkskul,
          nilaiKeaktifan,
          prestasiNama,
          nilaiPrestasi,
          catatan,
        }),
      });

      if (res.ok) {
        toast.success("Nilai ekskul & prestasi (C4 & C5) berhasil disimpan!");
        setOpenDialog(false);
        setPrestasiNama("");
        setCatatan("");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredScores = scores.filter(
    (s) =>
      s.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nis.includes(searchTerm) ||
      (s.namaEkskul && s.namaEkskul.toLowerCase().includes(searchTerm.toLowerCase()))
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
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-950 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/20 p-2.5 backdrop-blur-md">
              <Award className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Penilaian Ekstrakurikuler & Prestasi Siswa (Modul E: C4 & C5)
              </h1>
              <p className="text-xs text-navy-200">
                Pencatatan keaktifan ekskul kedirgantaraan (15%) dan prestasi perlombaan (10%) untuk SPK SMART
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchData}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Segarkan
            </Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger render={
                <Button size="sm" className="bg-amber-500 text-navy-950 hover:bg-amber-400 font-semibold">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Input Nilai C4 & C5
                </Button>
              }>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Input Penilaian Ekskul & Prestasi</DialogTitle>
                  <DialogDescription className="text-xs">
                    Nilai ini terhubung langsung ke formula normalisasi bobot SPK SMART
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Pilih Siswa</Label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
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
                    <Label className="text-xs font-medium">Nama Ekstrakurikuler Kedirgantaraan</Label>
                    <select
                      value={namaEkskul}
                      onChange={(e) => setNamaEkskul(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="Aero Modeling">Aero Modeling (RC & Drone)</option>
                      <option value="Pramuka Saka Dirgantara">Pramuka Saka Dirgantara</option>
                      <option value="Robotika Aviasi">Robotika Aviasi</option>
                      <option value="English Aviation Club">English Aviation Club</option>
                      <option value="PMR & P3K Udara">PMR & P3K Udara</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nilai Keaktifan C4 (15%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={nilaiKeaktifan}
                        onChange={(e) => setNilaiKeaktifan(parseFloat(e.target.value))}
                        required
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nilai Prestasi C5 (10%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={nilaiPrestasi}
                        onChange={(e) => setNilaiPrestasi(parseFloat(e.target.value))}
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nama Prestasi / Kejuaraan (Opsional)</Label>
                    <Input
                      placeholder="Contoh: Juara 1 LKS Aircraft Maintenance / RC Pylon"
                      value={prestasiNama}
                      onChange={(e) => setPrestasiNama(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Catatan Pembina Ekskul</Label>
                    <Input
                      placeholder="Catatan keaktifan siswa..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting} className="bg-navy-700 text-white">
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Simpan Penilaian
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-border/60 shadow-md">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Tabel Capaian C4 & C5 Siswa</CardTitle>
              <CardDescription className="text-xs">
                Data terintegrasi ke dalam formula SPK Siswa Berprestasi Metode SMART
              </CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari siswa atau ekskul..."
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
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead>Nama Siswa & NIS</TableHead>
                  <TableHead>Kelas & Jurusan</TableHead>
                  <TableHead>Ekstrakurikuler</TableHead>
                  <TableHead>Nilai Keaktifan (C4)</TableHead>
                  <TableHead>Prestasi Perlombaan (C5)</TableHead>
                  <TableHead>Catatan Pembina</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScores.map((s) => (
                  <TableRow key={s.id} className="text-xs">
                    <TableCell>
                      <p className="font-semibold text-foreground">{s.namaSiswa}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">NIS: {s.nis}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.kelas}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-navy-800">{s.namaEkskul}</TableCell>
                    <TableCell>
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {s.nilaiKeaktifan}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {s.nilaiPrestasi}
                        </span>
                        {s.prestasiNama && (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            • {s.prestasiNama}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.catatan || "-"}</TableCell>
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
