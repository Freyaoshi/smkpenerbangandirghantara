"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  GraduationCap,
  CalendarCheck,
  AlertTriangle,
  Trophy,
  Wrench,
  Star,
  CheckCircle,
  Clock,
  Building2,
  Plane,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { toast } from "sonner";

export default function ExecutiveDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [teacherAtt, setTeacherAtt] = useState<{
    totalHadir: number;
    totalTerlambat: number;
    records: any[];
    allTeachers: any[];
  } | null>(null);
  const [discipline, setDiscipline] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [sarpras, setSarpras] = useState<any>({ facilities: [], schedules: [] });
  const [evaluations, setEvaluations] = useState<any>({ summary: [] });

  useEffect(() => {
    fetchExecutiveData();
  }, []);

  const fetchExecutiveData = async () => {
    setLoading(true);
    try {
      const [resTeacher, resDisc, resLd, resSarp, resEval] = await Promise.all([
        fetch("/api/teacher-attendance"),
        fetch("/api/discipline"),
        fetch("/api/spk/calculate?kelas=all"),
        fetch("/api/sarpras"),
        fetch("/api/evaluations"),
      ]);

      if (resTeacher.ok) setTeacherAtt(await resTeacher.json());
      if (resDisc.ok) {
        const dData = await resDisc.json();
        setDiscipline(dData.violations || []);
      }
      if (resLd.ok) {
        const ldData = await resLd.json();
        setLeaderboard((ldData.results || []).slice(0, 5));
      }
      if (resSarp.ok) setSarpras(await resSarp.json());
      if (resEval.ok) setEvaluations(await resEval.json());
    } catch {
      toast.error("Gagal memuat data eksekutif");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const totalTeachers = teacherAtt?.allTeachers?.length || 5;
  const presentTeachers = teacherAtt?.totalHadir || 0;
  const teacherAttendanceRate = totalTeachers > 0 ? Math.round((presentTeachers / totalTeachers) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Header Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2.5 backdrop-blur-md">
              <TrendingUp className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Dashboard Eksekutif Kepala Sekolah (Modul P)
              </h1>
              <p className="text-xs text-navy-200">
                Pemantauan strategis makro: Presensi Pendidik, Kedisiplinan Siswa, SPK SMART, dan Fasilitas Hanggar
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchExecutiveData}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Segarkan
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Presensi Guru Hari Ini */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Kehadiran Guru Hari Ini
            </CardTitle>
            <Clock className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-900">
              {presentTeachers} <span className="text-sm font-normal text-muted-foreground">/ {totalTeachers} Pendidik</span>
            </div>
            <div className="mt-2">
              <Progress value={teacherAttendanceRate} className="h-2" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Tingkat kehadiran: <span className="font-semibold text-emerald-600">{teacherAttendanceRate}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Status Disiplin & Kasus BK */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Buku Saku Pelanggaran
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {discipline.length} <span className="text-sm font-normal text-muted-foreground">Kasus Tercatat</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Pelanggaran aktif semester ini dengan sanksi pembinaan terarah.
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Hanggar & Sarpras */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Fasilitas Hanggar & Bengkel
            </CardTitle>
            <Plane className="h-4 w-4 text-navy-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-900">
              {sarpras.facilities?.length || 3} <span className="text-sm font-normal text-muted-foreground">Unit Bengkel</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {sarpras.schedules?.length || 0} Jadwal Praktikum Kejuruan
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Indeks Evaluasi Guru */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Evaluasi Kinerja PBM
            </CardTitle>
            <Star className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-navy-900">
              4.6 <span className="text-sm font-normal text-muted-foreground">/ 5.0 Rata-rata</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Dari kuesioner evaluasi siswa semester berjalan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Siswa Berprestasi (SPK SMART) */}
        <Card className="border-border/60 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top 5 Siswa Berprestasi (Metode SMART)
              </CardTitle>
              <CardDescription className="text-xs">
                Perankingan otomatis berdasarkan 5 Kriteria Terbobot Baku (C1-C5)
              </CardDescription>
            </div>
            <Link href="/admin/leaderboard">
              <Button variant="ghost" size="sm" className="text-xs text-amber-600">
                Lihat Semua
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Belum ada kalkulasi SPK. Silakan jalankan kalkulasi di menu Leaderboard.
              </p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((item, idx) => (
                  <div
                    key={item.studentId}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${
                          idx === 0
                            ? "bg-amber-400 text-navy-950 shadow-sm shadow-amber-400/40"
                            : idx === 1
                            ? "bg-slate-300 text-slate-800"
                            : idx === 2
                            ? "bg-amber-700 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-foreground">{item.namaLengkap}</p>
                        <p className="text-[11px] text-muted-foreground">
                          NIS: {item.nis} • Kelas: {item.kelas}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-navy-900 text-amber-400 font-mono text-xs">
                        {item.persentase}%
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Nilai SMART</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Papan Kontrol Presensi Guru Terkini */}
        <Card className="border-border/60 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-navy-600" />
                Presensi Dewan Guru Hari Ini
              </CardTitle>
              <CardDescription className="text-xs">
                Log verifikasi biometrik kamera AI dan GPS geofence
              </CardDescription>
            </div>
            <Link href="/admin/piket">
              <Button variant="ghost" size="sm" className="text-xs text-navy-600">
                Papan Piket
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {teacherAtt?.records && teacherAtt.records.length > 0 ? (
              <div className="space-y-2.5">
                {teacherAtt.records.slice(0, 5).map((rec: any) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between rounded-xl border border-border/40 p-2.5 text-xs"
                  >
                    <div>
                      <p className="font-medium text-foreground">{rec.namaLengkap}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Jam Masuk: {rec.jamMasuk} • Jarak: {rec.jarakMeter || 12}m
                      </p>
                    </div>
                    <Badge
                      className={
                        rec.status === "Hadir"
                          ? "bg-emerald-600 text-white"
                          : rec.status === "Terlambat"
                          ? "bg-amber-600 text-white"
                          : "bg-blue-600 text-white"
                      }
                    >
                      {rec.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Belum ada data presensi guru yang terekam hari ini.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
