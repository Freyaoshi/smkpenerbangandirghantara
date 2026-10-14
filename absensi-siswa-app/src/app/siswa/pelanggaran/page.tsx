"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Info,
  Calendar,
  UserCheck,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
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

interface Violation {
  id: string;
  tanggal: string;
  namaPelanggaran: string;
  kategori: string;
  poin: number;
  tindakan: string;
  sanksi: string;
  reportedBy: string;
}

export default function SiswaPelanggaranPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [totalPoin, setTotalPoin] = useState(0);
  const [statusSP, setStatusSP] = useState("Aman");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscipline() {
      try {
        const meRes = await fetch("/api/students/me");
        if (meRes.ok) {
          const me = await meRes.json();
          const res = await fetch(`/api/discipline?studentId=${me.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.violations) {
              setViolations(data.violations);
              const pts = data.violations.reduce((sum: number, v: Violation) => sum + v.poin, 0);
              setTotalPoin(pts);
              if (pts >= 100) setStatusSP("Sidang Pleno Kesiswaan");
              else if (pts >= 75) setStatusSP("Surat Peringatan 3 (SP 3)");
              else if (pts >= 55) setStatusSP("Surat Peringatan 2 (SP 2)");
              else if (pts >= 30) setStatusSP("Surat Peringatan 1 (SP 1)");
              else setStatusSP("Aman (Taat Tata Tertib)");
            }
          }
        }
      } catch {
        toast.error("Gagal memuat catatan buku saku");
      } finally {
        setLoading(false);
      }
    }

    fetchDiscipline();
  }, []);

  const getStatusColor = () => {
    if (totalPoin >= 75) return "text-red-600 bg-red-50 border-red-200";
    if (totalPoin >= 30) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buku Saku Digital Kedisiplinan"
        description="Rekam jejak tata tertib, safety compliance hanggar kedirgantaraan, dan poin pembinaan siswa."
        icon={AlertTriangle}
      />

      {/* Point summary banner */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={`border ${getStatusColor()}`}>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold">Status Disiplin Anda</CardDescription>
            <div className="flex items-center gap-2 mt-1">
              {totalPoin >= 30 ? (
                <ShieldAlert className="h-6 w-6 text-amber-600" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              )}
              <CardTitle className="text-xl font-bold">{statusSP}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs pt-1">
            {totalPoin === 0
              ? "Catatan Anda bersih tanpa riwayat pelanggaran."
              : `Terakumulasi ${totalPoin} poin pelanggaran tata tertib.`}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Poin Pelanggaran</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-navy-950">{totalPoin}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Maksimum batas aman: &lt; 30 poin
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Skor Kedisiplinan SPK (C3)</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-amber-600">
              {Math.max(100 - totalPoin, 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Dihitung dari formula: 100 - Total Poin
          </CardContent>
        </Card>
      </div>

      {/* Threshold rules info */}
      <Card className="border-navy-100 bg-navy-50/40">
        <CardContent className="py-4">
          <div className="text-xs space-y-2">
            <div className="font-semibold text-navy-950 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-navy-600" />
              Ketentuan Akumulasi Poin Sanksi SMK Penerbangan Dirghantara:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-navy-800 pt-1">
              <div className="p-2 rounded bg-white/70 border border-navy-100">
                <span className="font-bold">0 - 29 Poin:</span> Tahap Pembinaan Wali Kelas
              </div>
              <div className="p-2 rounded bg-white/70 border border-navy-100">
                <span className="font-bold">30 - 54 Poin:</span> Panggilan Ortu (SP 1)
              </div>
              <div className="p-2 rounded bg-white/70 border border-navy-100">
                <span className="font-bold">55 - 74 Poin:</span> Skorsing 3 Hari (SP 2)
              </div>
              <div className="p-2 rounded bg-white/70 border border-navy-100">
                <span className="font-bold">75+ Poin:</span> Sidang Pleno / SP 3
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Riwayat Pelanggaran</CardTitle>
          <CardDescription>
            Transparansi catatan buku saku yang tercatat oleh Dewan Guru, Petugas Piket, dan Guru BK.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-navy-500" />
            </div>
          ) : violations.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <div className="font-semibold text-emerald-950 text-sm">
                Tidak Ada Catatan Pelanggaran
              </div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Luar biasa! Pertahankan sikap disiplin, kehormatan seragam kedirgantaraan, dan keselamatan kerja bengkel praktikum.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nama Pelanggaran</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-center">Poin</TableHead>
                    <TableHead>Tindakan & Sanksi</TableHead>
                    <TableHead>Pencatat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="text-xs whitespace-nowrap">{v.tanggal}</TableCell>
                      <TableCell className="text-xs font-medium text-navy-950">{v.namaPelanggaran}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            v.kategori === "Berat"
                              ? "bg-red-50 text-red-700 border-red-200 text-xs"
                              : v.kategori === "Sedang"
                              ? "bg-amber-50 text-amber-700 border-amber-200 text-xs"
                              : "bg-slate-50 text-slate-700 text-xs"
                          }
                        >
                          {v.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive" className="text-xs">
                          +{v.poin}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>{v.tindakan}</div>
                        <div className="italic text-[11px] text-foreground">{v.sanksi}</div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{v.reportedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
