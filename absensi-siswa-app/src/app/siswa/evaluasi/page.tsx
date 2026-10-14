"use client";

import { useState, useEffect } from "react";
import {
  Star,
  GraduationCap,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Teacher {
  id: string;
  namaLengkap: string;
  nip: string;
  jabatan?: string;
}

export default function SiswaEvaluasiPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Form states
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("Aerodynamics & Flight Control");
  const [pedagogik, setPedagogik] = useState(5);
  const [profesional, setProfesional] = useState(5);
  const [kepribadian, setKepribadian] = useState(5);
  const [sosial, setSosial] = useState(5);
  const [saran, setSaran] = useState("");

  useEffect(() => {
    async function loadTeachers() {
      try {
        const res = await fetch("/api/teachers");
        if (res.ok) {
          const data = await res.json();
          setTeachers(data);
          if (data.length > 0) {
            setSelectedTeacherId(data[0].id);
          }
        }
      } catch {
        toast.error("Gagal memuat daftar guru");
      } finally {
        setLoading(false);
      }
    }
    loadTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherId) {
      toast.error("Silakan pilih guru terlebih dahulu");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          mapel: selectedMapel,
          skorPedagogik: pedagogik,
          skorProfesional: profesional,
          skorKepribadian: kepribadian,
          skorSosial: sosial,
          saran: saran || "Pembelajaran sangat baik dan jelas",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengirim evaluasi");
      }

      toast.success("Kuesioner evaluasi guru berhasil dikirim secara anonim!");
      setSubmittedSuccess(true);
      setSaran("");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRatingGroup = (
    label: string,
    desc: string,
    value: number,
    setValue: (val: number) => void
  ) => {
    return (
      <div className="space-y-2 p-3.5 rounded-lg border bg-card/60">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-sm text-navy-950">{label}</div>
            <div className="text-xs text-muted-foreground">{desc}</div>
          </div>
          <Badge variant="outline" className="text-xs font-bold text-amber-600 bg-amber-50">
            {value} / 5 Bintang
          </Badge>
        </div>
        <div className="flex gap-2 pt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setValue(star)}
              className={`flex-1 py-1.5 rounded flex items-center justify-center transition-all ${
                value >= star
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Star className="h-4 w-4 fill-current" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Evaluasi Pembelajaran Guru (PBM)"
        description="Survei umpan balik taruna/taruni untuk peningkatan mutu pengajaran dan praktikum kedirgantaraan (Anonim & Terjaga)."
        icon={Star}
      />

      {submittedSuccess && (
        <Card className="border-emerald-300 bg-emerald-50/70">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-emerald-950">
                Terima kasih atas partisipasi Anda!
              </div>
              <div className="text-xs text-emerald-800">
                Evaluasi Anda telah disimpan dengan aman dan dirahasiakan identitasnya untuk perbaikan proses belajar mengajar.
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="ml-auto text-xs bg-white"
              onClick={() => setSubmittedSuccess(false)}
            >
              Isi Guru Lain
            </Button>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pilih Guru & Mata Pelajaran</CardTitle>
            <CardDescription>
              Tentukan dewan guru yang ingin Anda evaluasi pada periode semester berjalan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eval-guru">Dewan Guru</Label>
                <Select value={selectedTeacherId} onValueChange={(val) => setSelectedTeacherId(val || "")}>
                  <SelectTrigger id="eval-guru">
                    <SelectValue placeholder="Pilih Guru" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.namaLengkap} ({t.jabatan || "Dewan Guru"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eval-mapel">Mata Pelajaran / Praktikum</Label>
                <Select value={selectedMapel} onValueChange={(val) => setSelectedMapel(val || "")}>
                  <SelectTrigger id="eval-mapel">
                    <SelectValue placeholder="Pilih Mapel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aerodynamics & Flight Control">Aerodynamics & Flight Control</SelectItem>
                    <SelectItem value="Aircraft System & Powerplant">Aircraft System & Powerplant</SelectItem>
                    <SelectItem value="Aviation Electronics & Instruments">Aviation Electronics & Instruments</SelectItem>
                    <SelectItem value="Airframe Maintenance & Inspection">Airframe Maintenance & Inspection</SelectItem>
                    <SelectItem value="Aviation English Technical">Aviation English Technical</SelectItem>
                    <SelectItem value="Matematika Terapan Kedirgantaraan">Matematika Terapan</SelectItem>
                    <SelectItem value="Fisika Terapan">Fisika Terapan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 Competencies Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Penilaian 4 Kompetensi Pengajar</CardTitle>
            <CardDescription>
              Berikan penilaian objektif berdasarkan pengalaman belajar dan praktikum Anda di hanggar/kelas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderRatingGroup(
              "1. Kompetensi Pedagogik",
              "Kejelasan penyampaian materi, keteraturan jobsheet praktikum hanggar, dan penguasaan suasana belajar.",
              pedagogik,
              setPedagogik
            )}

            {renderRatingGroup(
              "2. Kompetensi Profesional",
              "Kedalaman materi aviasi, relevansi dengan industri penerbangan (FAA/DGCA), dan ketelitian instruksi K3.",
              profesional,
              setProfesional
            )}

            {renderRatingGroup(
              "3. Kompetensi Kepribadian",
              "Keteladanan kedisiplinan waktu, wibawa, ketegasan yang adil, serta motivasi yang diberikan.",
              kepribadian,
              setKepribadian
            )}

            {renderRatingGroup(
              "4. Kompetensi Sosial",
              "Komunikasi yang terbuka, kesediaan membimbing saat siswa mengalami kesulitan praktikum, dan keramahan.",
              sosial,
              setSosial
            )}

            <div className="space-y-2 pt-2">
              <Label htmlFor="eval-saran">Saran & Masukan Membangun (Opsional)</Label>
              <Textarea
                id="eval-saran"
                rows={3}
                placeholder="Tuliskan masukan untuk bapak/ibu guru demi kenyamanan dan peningkatan mutu belajar..."
                value={saran}
                onChange={(e) => setSaran(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-navy-600 hover:bg-navy-700 text-white gap-2 shadow-sm px-6"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Kirim Evaluasi Guru
          </Button>
        </div>
      </form>
    </div>
  );
}
