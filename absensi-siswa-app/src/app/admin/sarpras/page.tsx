"use client";

import { useState, useEffect } from "react";
import {
  Wrench,
  Plane,
  CalendarCheck,
  ShieldAlert,
  PlusCircle,
  Building2,
  Clock,
  User,
  CheckCircle,
  Loader2,
  RefreshCw,
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
import { toast } from "sonner";

export default function SarprasHanggarPage() {
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);

  // Dialog Schedule
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [sFacilityId, setSFacilityId] = useState("");
  const [sKelas, setSKelas] = useState("X-AP-1");
  const [sTanggal, setSTanggal] = useState("");
  const [sJamMulai, setSJamMulai] = useState("08:00");
  const [sJamSelesai, setSJamSelesai] = useState("11:30");
  const [sGuru, setSGuru] = useState("");
  const [sKeperluan, setSKeperluan] = useState("");
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSarpras, resClasses] = await Promise.all([
        fetch("/api/sarpras"),
        fetch("/api/classes"),
      ]);

      if (resSarpras.ok) {
        const sData = await resSarpras.json();
        setFacilities(sData.facilities || []);
        setSchedules(sData.schedules || []);
      }
      if (resClasses.ok) setClassesList(await resClasses.json());
    } catch {
      toast.error("Gagal memuat data sarana prasarana");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sFacilityId || !sTanggal || !sKeperluan) {
      toast.error("Semua data jadwal praktikum wajib diisi");
      return;
    }

    setSubmittingSchedule(true);
    try {
      const res = await fetch("/api/sarpras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          facilityId: sFacilityId,
          kelas: sKelas,
          tanggal: sTanggal,
          jamMulai: sJamMulai,
          jamSelesai: sJamSelesai,
          guruPengampu: sGuru,
          keperluan: sKeperluan,
        }),
      });

      if (res.ok) {
        toast.success("Jadwal praktikum berhasil dijadwalkan!");
        setOpenScheduleDialog(false);
        setSKeperluan("");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menjadwalkan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmittingSchedule(false);
    }
  };

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
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2.5 backdrop-blur-md">
              <Plane className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Sarana & Fasilitas Praktik Aviasi (Modul I)
              </h1>
              <p className="text-xs text-navy-200">
                Profil Hanggar Pesawat, Bengkel Airframe & Avionics, Jadwal Praktikum, dan SOP Keselamatan Kerja K3
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

            <Dialog open={openScheduleDialog} onOpenChange={setOpenScheduleDialog}>
              <DialogTrigger render={
                <Button size="sm" className="bg-amber-500 text-navy-950 hover:bg-amber-400 font-semibold">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Jadwalkan Praktik
                </Button>
              }>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Jadwal Pemakaian Fasilitas Bengkel</DialogTitle>
                  <DialogDescription className="text-xs">
                    Pengajuan pemakaian hanggar pesawat atau bengkel praktikum kejuruan
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddSchedule} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Pilih Fasilitas</Label>
                    <select
                      value={sFacilityId}
                      onChange={(e) => setSFacilityId(e.target.value)}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="">-- Pilih Fasilitas / Bengkel --</option>
                      {facilities.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.namaFasilitas} ({f.kondisi})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Kelas</Label>
                      <select
                        value={sKelas}
                        onChange={(e) => setSKelas(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        {classesList.map((c) => (
                          <option key={c.id} value={c.namaKelas}>
                            {c.namaKelas}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Tanggal Praktik</Label>
                      <Input
                        type="date"
                        value={sTanggal}
                        onChange={(e) => setSTanggal(e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Jam Mulai</Label>
                      <Input
                        type="time"
                        value={sJamMulai}
                        onChange={(e) => setSJamMulai(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Jam Selesai</Label>
                      <Input
                        type="time"
                        value={sJamSelesai}
                        onChange={(e) => setSJamSelesai(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Guru Instruktur / Pengampu</Label>
                    <Input
                      placeholder="Nama guru pengampu..."
                      value={sGuru}
                      onChange={(e) => setSGuru(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Keperluan Praktik</Label>
                    <Input
                      placeholder="Contoh: Sheet metal riveting / Starting engine Cessna"
                      value={sKeperluan}
                      onChange={(e) => setSKeperluan(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenScheduleDialog(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={submittingSchedule} className="bg-navy-700 text-white">
                      {submittingSchedule ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Simpan Jadwal
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="profil">Profil Bengkel & Hanggar</TabsTrigger>
          <TabsTrigger value="jadwal">Jadwal Praktikum</TabsTrigger>
          <TabsTrigger value="sop">SOP Keselamatan (K3)</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profil Fasilitas */}
        <TabsContent value="profil" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {facilities.map((f) => (
              <Card key={f.id} className="border-border/60 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {f.kode}
                    </Badge>
                    <Badge className="bg-emerald-600 text-white text-[10px]">{f.kondisi}</Badge>
                  </div>
                  <CardTitle className="text-base font-semibold mt-2">{f.namaFasilitas}</CardTitle>
                  <CardDescription className="text-xs">{f.kategori}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-t text-muted-foreground">
                    <span>Kapasitas:</span>
                    <span className="font-semibold text-foreground">{f.kapasitas} Taruna/Siswa</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t text-muted-foreground">
                    <span>Penanggung Jawab:</span>
                    <span className="font-semibold text-foreground">{f.penanggungJawab || "-"}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="font-medium text-[11px] text-amber-700 flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" /> SOP Keselamatan:
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-3">
                      {f.sopKeselamatan || "Patuhi rambu K3 hanggar penerbangan."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Jadwal Praktikum */}
        <TabsContent value="jadwal" className="space-y-4">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Jadwal Pemakaian Fasilitas Bengkel</CardTitle>
              <CardDescription className="text-xs">
                Jadwal praktikum kejuruan siswa di Hanggar dan Bengkel Aviasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Belum ada jadwal praktikum yang terdaftar.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 text-xs">
                        <TableHead>Fasilitas</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Instruktur</TableHead>
                        <TableHead>Materi / Keperluan</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((s) => (
                        <TableRow key={s.id} className="text-xs">
                          <TableCell className="font-semibold text-foreground">{s.namaFasilitas}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{s.kelas}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">{s.tanggal}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {s.jamMulai} - {s.jamSelesai}
                          </TableCell>
                          <TableCell className="font-medium">{s.guruPengampu}</TableCell>
                          <TableCell className="text-muted-foreground">{s.keperluan}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600 text-white text-[10px]">{s.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: SOP K3 Bengkel */}
        <TabsContent value="sop" className="space-y-4">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                Standar Operasional Prosedur (SOP) Keselamatan Kerja Bengkel Penerbangan
              </CardTitle>
              <CardDescription className="text-xs">
                Ketentuan wajib K3 (Kesehatan & Keselamatan Kerja) bengkel aviasi SMK Penerbangan Dirghantara
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2 text-amber-950">
                <h4 className="font-bold text-sm">1. Alat Pelindung Diri (APD) Wajib:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Wearpack kejuruan resmi berlambang SMK Penerbangan Dirghantara yang terkancing rapi.</li>
                  <li>Safety shoes dengan toe-cap baja standar bengkel aviasi.</li>
                  <li>Ear defender / ear plug saat uji coba putaran engine pesawat (engine run-up).</li>
                  <li>Safety glasses saat pengelasan, pemotongan plat sheet metal, dan pembersihan borescope.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 space-y-2 text-navy-950">
                <h4 className="font-bold text-sm">2. Tata Tertib Penggunaan Alat & Bahan:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Dilarang mengoperasikan mesin bubut, milling, atau pneumatic rivet gun tanpa pengawasan instruktur.</li>
                  <li>Pastikan prosedur Lockout / Tagout terpasang pada saklar utama sirkuit pesawat.</li>
                  <li>Bahan kimia aviasi (Hydraulic fluid Skydrol, Jet fuel, thinner) harus disimpan di loker flammables bersertifikasi.</li>
                  <li>Alat pemadam api ringan (APAR) Co2 dan Powder wajib dicek kondisinya sebelum praktikum dimulai.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
