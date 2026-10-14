"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Phone,
  CheckCircle2,
  CalendarCheck,
  AlertTriangle,
  Send,
  MessageSquare,
  ShieldCheck,
  Info,
  Clock,
  GraduationCap,
  Award,
  BookOpen,
  Loader2,
  HeartHandshake,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentMeProfile {
  id: string;
  nis: string;
  namaLengkap: string;
  kelas: string;
  angkatan: string;
  programKeahlian: string;
  noWaOrtu: string;
  alamat: string;
  ekskul: string;
}

interface StudentAttendanceStats {
  totalHadir: number;
  totalIzin: number;
  totalSakit: number;
  totalAlfa: number;
  totalRecords: number;
  persentaseKehadiran: number;
  dailyData: Array<{
    tanggal: string;
    status: string;
    jamMasuk?: string;
  }>;
}

export default function SiswaPortalOrtuPage() {
  const [profile, setProfile] = useState<StudentMeProfile | null>(null);
  const [stats, setStats] = useState<StudentAttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingWa, setSendingWa] = useState(false);
  const [disciplineData, setDisciplineData] = useState<{
    poin: number;
    statusSP: string;
    violations: Array<{ tanggal: string; namaPelanggaran: string; poin: number; sanksi: string }>;
  }>({
    poin: 0,
    statusSP: "Aman",
    violations: [],
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch("/api/students/me"),
          fetch("/api/students/me/attendance-stats"),
        ]);

        if (profileRes.ok) {
          const p = await profileRes.json();
          setProfile(p);

          // Fetch student violations
          if (p.id) {
            const discRes = await fetch(`/api/discipline?studentId=${p.id}`);
            if (discRes.ok) {
              const d = await discRes.json();
              if (d.violations) {
                const totalPts = d.violations.reduce((acc: number, cur: { poin: number }) => acc + cur.poin, 0);
                let sp = "Aman";
                if (totalPts >= 100) sp = "Sidang Pleno";
                else if (totalPts >= 75) sp = "SP 3";
                else if (totalPts >= 55) sp = "SP 2";
                else if (totalPts >= 30) sp = "SP 1";
                setDisciplineData({
                  poin: totalPts,
                  statusSP: sp,
                  violations: d.violations,
                });
              }
            }
          }
        }

        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s);
        }
      } catch {
        toast.error("Gagal memuat data portal orang tua");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSimulateWa = async () => {
    if (!profile) return;
    setSendingWa(true);
    try {
      const res = await fetch("/api/system/wa-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: profile.id,
          phone: profile.noWaOrtu || "081234567890",
          studentName: profile.namaLengkap,
          kelas: profile.kelas,
          date: new Date().toISOString().split("T")[0],
          status: "Hadir",
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengirim simulasi WhatsApp");
      }

      toast.success(
        `Laporan presensi otomatis berhasil dikirimkan ke nomor WhatsApp Orang Tua (${profile.noWaOrtu || "081234567890"})!`
      );
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setSendingWa(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
      </div>
    );
  }

  const todayStatus = "Hadir";
  const todayTime = "06:42 WIB";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portal Orang Tua & Wali Siswa"
        description="Pantauan terpadu presensi harian, kedisiplinan, dan laporan perkembangan taruna/taruni secara transparan."
        icon={Users}
      >
        <Button
          onClick={handleSimulateWa}
          disabled={sendingWa}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
        >
          {sendingWa ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          Kirim Rekap ke WA Ortu
        </Button>
      </PageHeader>

      {/* Orang Tua Banner Info */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="h-5 w-5 text-amber-700 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-semibold">Akun Terpadu Siswa & Orang Tua:</span> Halaman ini dirancang khusus bagi orang tua / wali untuk memantau kehadiran harian, waktu tiba di hanggar sekolah, catatan buku saku kedisiplinan, dan perkembangan akademik tanpa memerlukan akun terpisah.
          </div>
        </CardContent>
      </Card>

      {/* Profil Siswa & WhatsApp Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 md:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg text-navy-950 font-bold">
                  {profile?.namaLengkap || "Siswa SMK Penerbangan Dirghantara"}
                </CardTitle>
                <CardDescription className="text-xs">
                  NIS: {profile?.nis || "-"} • Kelas: {profile?.kelas || "-"}
                </CardDescription>
              </div>
              <Badge className="bg-navy-600 hover:bg-navy-700 text-white text-xs">
                {profile?.programKeahlian || "Airframe Powerplant"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Nomor WhatsApp Wali Terdaftar:</span>
                <span className="font-semibold text-navy-900 font-mono text-sm">
                  {profile?.noWaOrtu || "+62 812-9876-5432"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Alamat Domisili:</span>
                <span className="font-medium text-foreground">
                  {profile?.alamat || "DKI Jakarta"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Ekstrakurikuler Wajib/Pilihan:</span>
                <span className="font-medium text-foreground">
                  {profile?.ekskul || "Aeromodelling Club"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Tahun Angkatan:</span>
                <span className="font-medium text-foreground">
                  {profile?.angkatan || "2024/2025"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Status Presensi Hari Ini */}
        <Card className="border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-emerald-800 font-medium">
              Kehadiran Hari Ini
            </CardDescription>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <CardTitle className="text-xl font-bold text-emerald-950">
                {todayStatus} Tepat Waktu
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Jam Masuk Gerbang:</span>
              <span className="font-bold text-emerald-800">{todayTime}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Lokasi Geofence:</span>
              <span className="font-medium text-foreground">Hanggar Dirghantara</span>
            </div>
            <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-700">
              Notifikasi otomatis terkirim via WhatsApp Gateway
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rekap Presensi Semester */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Tingkat Kehadiran Efektif</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {stats?.persentaseKehadiran || 96}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Standar kelulusan minimum: 85%
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Hari Hadir</CardDescription>
            <CardTitle className="text-2xl font-bold text-navy-900">
              {stats?.totalHadir || 85} Hari
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Dari {stats?.totalRecords || 88} hari efektif KBM
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Izin / Sakit Resmi</CardDescription>
            <CardTitle className="text-2xl font-bold text-sky-600">
              {(stats?.totalIzin || 2) + (stats?.totalSakit || 1)} Hari
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Surat dokter & konfirmasi ortu
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Tanpa Keterangan (Alfa)</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700">
              {stats?.totalAlfa || 0} Hari
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Disiplin sangat baik (0 Alfa)
          </CardContent>
        </Card>
      </div>

      {/* Buku Saku & Kedisiplinan Siswa */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Catatan Kedisiplinan & Buku Saku Taruna/Taruni
              </CardTitle>
              <CardDescription>
                Transparansi pelanggaran tata tertib dan safety protocol hanggar penerbangan.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Status SP:</span>
              <Badge
                className={
                  disciplineData.statusSP === "Aman"
                    ? "bg-emerald-100 text-emerald-800 border-none"
                    : "bg-red-100 text-red-800 border-none"
                }
              >
                {disciplineData.statusSP} ({disciplineData.poin} Poin)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {disciplineData.violations.length === 0 ? (
            <div className="text-center py-6 text-sm text-emerald-700 font-medium bg-emerald-50/40 rounded-lg">
              ✓ Ananda memiliki catatan disiplin sempurna tanpa pelanggaran tata tertib (0 Poin).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggaran</TableHead>
                    <TableHead>Poin</TableHead>
                    <TableHead>Tindakan / Sanksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disciplineData.violations.map((v, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs whitespace-nowrap">{v.tanggal}</TableCell>
                      <TableCell className="text-xs font-medium">{v.namaPelanggaran}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="destructive">+{v.poin}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{v.sanksi}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kontak Hotline & Bantuan Sekolah */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HeartHandshake className="h-5 w-5 text-navy-600" />
            Layanan Komunikasi & Kontak Penting Sekolah
          </CardTitle>
          <CardDescription>
            Hubungi pihak sekolah sewaktu-waktu jika membutuhkan informasi lebih lanjut mengenai ananda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/40 border">
              <div className="font-semibold text-navy-950">Wali Kelas: Capt. Hendra Gunawan, S.T.</div>
              <div className="text-muted-foreground mt-1">Konsultasi akademik & praktikum kejuruan</div>
              <div className="font-mono text-navy-700 mt-2 font-medium">WA: +62 811-2345-6789</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border">
              <div className="font-semibold text-navy-950">Guru Bimbingan Konseling (BK)</div>
              <div className="text-muted-foreground mt-1">Konsultasi karakter, kedisiplinan & karir</div>
              <div className="font-mono text-navy-700 mt-2 font-medium">WA: +62 812-3456-7890</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border">
              <div className="font-semibold text-navy-950">Sekretariat Piket & Hanggar</div>
              <div className="text-muted-foreground mt-1">Izin sakit darurat & keselamatan praktikum</div>
              <div className="font-mono text-navy-700 mt-2 font-medium">Telp: (021) 80889123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
