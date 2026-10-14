"use client";

import { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  role: string;
  modul: string;
  action: string;
  detail: string;
  createdAt: string;
}

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModul, setSelectedModul] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [selectedModul]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url =
        selectedModul !== "all"
          ? `/api/audit-logs?modul=${encodeURIComponent(selectedModul)}`
          : `/api/audit-logs`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      } else {
        toast.error("Gagal memuat log audit");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.modul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">CREATE</Badge>;
      case "UPDATE":
        return <Badge className="bg-amber-600 text-white hover:bg-amber-700">UPDATE</Badge>;
      case "DELETE":
        return <Badge className="bg-red-600 text-white hover:bg-red-700">DELETE</Badge>;
      case "CALCULATE":
        return <Badge className="bg-blue-600 text-white hover:bg-blue-700">SPK CALC</Badge>;
      case "NOTIFIKASI":
        return <Badge className="bg-purple-600 text-white hover:bg-purple-700">WA NOTIF</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2.5 backdrop-blur-md">
              <History className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Riwayat Aktivitas & Audit Trail (Modul O)
              </h1>
              <p className="text-xs text-navy-200">
                Pencatatan log transaksi, perubahan data krusial, dan otorisasi sistem untuk integritas SIMESA
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLogs}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Segarkan Log
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari pengguna, modul, atau rincian aksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedModul}
                onChange={(e) => setSelectedModul(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-xs"
              >
                <option value="all">Semua Modul</option>
                <option value="Buku Saku BK">Buku Saku BK</option>
                <option value="Mading Sekolah">Mading Sekolah</option>
                <option value="WhatsApp Gateway">WhatsApp Gateway</option>
                <option value="Konfigurasi Sistem">Konfigurasi Sistem</option>
                <option value="SPK SMART">SPK SMART</option>
                <option value="Presensi">Presensi</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card className="border-border/60 shadow-md">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Daftar Rekam Jejak Sistem</CardTitle>
          <CardDescription className="text-xs">
            Menampilkan {filteredLogs.length} entri audit trail tercatat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <History className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">Belum ada riwayat aktivitas yang tercatat</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[170px] text-xs">Waktu & Tanggal</TableHead>
                    <TableHead className="text-xs">Pengguna</TableHead>
                    <TableHead className="text-xs">Peran</TableHead>
                    <TableHead className="text-xs">Modul</TableHead>
                    <TableHead className="text-xs">Aksi</TableHead>
                    <TableHead className="text-xs">Rincian Perubahan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const dateObj = new Date(log.createdAt);
                    const formattedDate = dateObj.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = dateObj.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <TableRow key={log.id} className="text-xs hover:bg-muted/30">
                        <TableCell className="font-mono text-muted-foreground">
                          {formattedDate} {formattedTime}
                        </TableCell>
                        <TableCell className="font-medium">{log.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {log.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-navy-800">{log.modul}</span>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell className="max-w-md text-muted-foreground break-words">
                          {log.detail}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
