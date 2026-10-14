"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  Search,
  Calendar,
  AlertCircle,
  Tag,
  Loader2,
  Bell,
  Pin,
  Clock,
  User,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Announcement {
  id: string;
  judul: string;
  kategori: string;
  konten: string;
  prioritas: string;
  tanggalMulai: string;
  tanggalSelesai: string | null;
  authorName: string;
  createdAt: string;
}

export default function SiswaMadingPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("all");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const filtered = announcements.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.konten.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKategori =
      selectedKategori === "all" || item.kategori === selectedKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mading Sekolah Dirghantara"
        description="Papan informasi digital resmi: agenda sekolah, jadwal praktikum hanggar, kalender akademik, dan kegiatan ekstrakurikuler."
        icon={Megaphone}
      />

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pengumuman..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Kategori:
              </span>
              <Select value={selectedKategori} onValueChange={(val) => setSelectedKategori(val || "all")}>
                <SelectTrigger className="w-[180px] h-9 text-xs">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="Agenda Sekolah">Agenda Sekolah</SelectItem>
                  <SelectItem value="Akademik">Akademik</SelectItem>
                  <SelectItem value="SOP Hanggar">SOP Hanggar</SelectItem>
                  <SelectItem value="Kedisiplinan">Kedisiplinan</SelectItem>
                  <SelectItem value="Ekstrakurikuler">Ekstrakurikuler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto stroke-1" />
            <h3 className="text-lg font-semibold text-foreground">Belum ada pengumuman</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Tidak ada pengumuman yang sesuai dengan kriteria filter Anda saat ini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const isImportant = item.prioritas === "Penting";
            return (
              <Card
                key={item.id}
                className={`border transition-all hover:shadow-md ${
                  isImportant
                    ? "border-amber-400 bg-amber-50/20 shadow-sm"
                    : "border-border/60"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className="bg-navy-50 text-navy-800 border-navy-200 text-xs"
                    >
                      <Tag className="h-3 w-3 mr-1" /> {item.kategori}
                    </Badge>
                    {isImportant && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs gap-1">
                        <Pin className="h-3 w-3" /> Pengumuman Penting
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base text-navy-950 mt-2">
                    {item.judul}
                  </CardTitle>
                  <CardDescription className="text-xs flex items-center gap-3 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> {item.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {item.tanggalMulai}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                    {item.konten}
                  </p>
                  {item.tanggalSelesai && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 pt-2 border-t">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      Berlaku sampai: {item.tanggalSelesai}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
