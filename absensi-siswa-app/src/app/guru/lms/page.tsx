"use client";

import { useState, useEffect } from "react";
import {
  Laptop,
  BookOpen,
  FileCheck,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Layers,
  GraduationCap,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LmsMaterial {
  id: string;
  mapel: string;
  kelas: string;
  judul: string;
  deskripsi: string | null;
  fileUrl: string | null;
  tipe: string;
  guruNama: string;
  createdAt: string;
}

interface LmsAssignment {
  id: string;
  mapel: string;
  kelas: string;
  judul: string;
  deskripsi: string | null;
  tenggatWaktu: string;
  guruNama: string;
  createdAt: string;
}

interface LmsSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  namaSiswa: string;
  nis: string;
  kelas: string;
  catatan: string | null;
  fileUrl: string | null;
  nilai: number | null;
  feedback: string | null;
  submittedAt: string;
}

export default function GuruLmsPage() {
  const [activeTab, setActiveTab] = useState("materials");
  const [materials, setMaterials] = useState<LmsMaterial[]>([]);
  const [assignments, setAssignments] = useState<LmsAssignment[]>([]);
  const [submissions, setSubmissions] = useState<LmsSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedKelas, setSelectedKelas] = useState("all");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("all");

  // Modal create material
  const [matDialogOpen, setMatDialogOpen] = useState(false);
  const [matForm, setMatForm] = useState({
    judul: "",
    mapel: "Aerodynamics & Flight Control",
    kelas: "X-AP-1",
    deskripsi: "",
    fileUrl: "",
    tipe: "Modul PDF",
  });
  const [submittingMat, setSubmittingMat] = useState(false);

  // Modal create assignment
  const [assDialogOpen, setAssDialogOpen] = useState(false);
  const [assForm, setAssForm] = useState({
    judul: "",
    mapel: "Aerodynamics & Flight Control",
    kelas: "X-AP-1",
    deskripsi: "",
    tenggatWaktu: "",
  });
  const [submittingAss, setSubmittingAss] = useState(false);

  // Grading states
  const [gradingScores, setGradingScores] = useState<Record<string, { nilai: string; feedback: string }>>({});
  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/lms/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch {
      toast.error("Gagal memuat materi pembelajaran");
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/lms/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch {
      toast.error("Gagal memuat tugas pembelajaran");
    }
  };

  const fetchSubmissions = async () => {
    try {
      const url =
        selectedAssignmentId && selectedAssignmentId !== "all"
          ? `/api/lms/submissions?assignmentId=${selectedAssignmentId}`
          : "/api/lms/submissions";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
        // Pre-fill grading inputs
        const initialMap: Record<string, { nilai: string; feedback: string }> = {};
        data.forEach((s: LmsSubmission) => {
          initialMap[s.id] = {
            nilai: s.nilai !== null ? String(s.nilai) : "",
            feedback: s.feedback || "",
          };
        });
        setGradingScores(initialMap);
      }
    } catch {
      toast.error("Gagal memuat pengumpulan tugas");
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchMaterials(), fetchAssignments(), fetchSubmissions()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (activeTab === "submissions") {
      fetchSubmissions();
    }
  }, [selectedAssignmentId, activeTab]);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matForm.judul || !matForm.mapel || !matForm.kelas) {
      toast.error("Mohon isi judul, mapel, dan kelas");
      return;
    }
    setSubmittingMat(true);
    try {
      const res = await fetch("/api/lms/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(matForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengunggah materi");
      }
      toast.success("Materi pembelajaran berhasil diunggah!");
      setMatDialogOpen(false);
      setMatForm({
        judul: "",
        mapel: "Aerodynamics & Flight Control",
        kelas: "X-AP-1",
        deskripsi: "",
        fileUrl: "",
        tipe: "Modul PDF",
      });
      fetchMaterials();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setSubmittingMat(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assForm.judul || !assForm.mapel || !assForm.kelas || !assForm.tenggatWaktu) {
      toast.error("Mohon lengkapi judul, mapel, kelas, dan tenggat waktu");
      return;
    }
    setSubmittingAss(true);
    try {
      const res = await fetch("/api/lms/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assForm),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal membuat tugas");
      }
      toast.success("Tugas mandiri berhasil dibuat!");
      setAssDialogOpen(false);
      setAssForm({
        judul: "",
        mapel: "Aerodynamics & Flight Control",
        kelas: "X-AP-1",
        deskripsi: "",
        tenggatWaktu: "",
      });
      fetchAssignments();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setSubmittingAss(false);
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    const gradeData = gradingScores[submissionId];
    if (!gradeData || gradeData.nilai === "") {
      toast.error("Silakan masukkan nilai terlebih dahulu");
      return;
    }
    const val = Number(gradeData.nilai);
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error("Nilai harus antara 0 dan 100");
      return;
    }

    setSavingGradeId(submissionId);
    try {
      const res = await fetch("/api/lms/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          submissionId,
          nilai: val,
          feedback: gradeData.feedback || "Tugas telah diperiksa",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan nilai");
      }
      toast.success("Nilai dan evaluasi berhasil disimpan!");
      fetchSubmissions();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setSavingGradeId(null);
    }
  };

  const filteredMaterials =
    selectedKelas === "all"
      ? materials
      : materials.filter((m) => m.kelas.includes(selectedKelas));

  const filteredAssignments =
    selectedKelas === "all"
      ? assignments
      : assignments.filter((a) => a.kelas.includes(selectedKelas));

  return (
    <div className="space-y-6">
      <PageHeader
        title="LMS Pembelajaran Kejuruan"
        description="Kelola materi ajar kedirgantaraan, penugasan mandiri & praktikum hanggar, serta penilaian tugas siswa."
        icon={Laptop}
      >
        <div className="flex gap-2">
          {/* Dialog Upload Materi */}
          <Dialog open={matDialogOpen} onOpenChange={setMatDialogOpen}>
            <DialogTrigger
              render={
                <Button className="bg-navy-600 hover:bg-navy-700 text-white gap-2 shadow-sm">
                  <Plus className="h-4 w-4" /> Unggah Materi
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleCreateMaterial}>
                <DialogHeader>
                  <DialogTitle>Unggah Modul / Materi Pembelajaran</DialogTitle>
                  <DialogDescription>
                    Materi akan langsung dapat diakses dan diunduh oleh siswa sesuai kelasnya.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="m-judul">Judul Materi</Label>
                    <Input
                      id="m-judul"
                      placeholder="Contoh: Modul 03: Prinsip Bernoulli & Gaya Angkat Sayap"
                      value={matForm.judul}
                      onChange={(e) => setMatForm({ ...matForm, judul: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="m-mapel">Mata Pelajaran</Label>
                      <Select
                        value={matForm.mapel}
                        onValueChange={(val) => setMatForm({ ...matForm, mapel: val || "" })}
                      >
                        <SelectTrigger id="m-mapel">
                          <SelectValue placeholder="Pilih mapel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aerodynamics & Flight Control">Aerodynamics & Flight Control</SelectItem>
                          <SelectItem value="Aircraft System & Powerplant">Aircraft System & Powerplant</SelectItem>
                          <SelectItem value="Aviation Electronics & Instruments">Aviation Electronics & Instruments</SelectItem>
                          <SelectItem value="Airframe Maintenance & Inspection">Airframe Maintenance & Inspection</SelectItem>
                          <SelectItem value="Aviation English Technical">Aviation English Technical</SelectItem>
                          <SelectItem value="Matematika Terapan">Matematika Terapan</SelectItem>
                          <SelectItem value="Fisika Terapan Kedirgantaraan">Fisika Terapan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="m-kelas">Target Kelas</Label>
                      <Select
                        value={matForm.kelas}
                        onValueChange={(val) => setMatForm({ ...matForm, kelas: val || "" })}
                      >
                        <SelectTrigger id="m-kelas">
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="X-AP-1">X-AP-1 (Airframe Powerplant)</SelectItem>
                          <SelectItem value="X-EA-1">X-EA-1 (Electrical Avionics)</SelectItem>
                          <SelectItem value="XI-AP-1">XI-AP-1 (Airframe Powerplant)</SelectItem>
                          <SelectItem value="XI-EA-1">XI-EA-1 (Electrical Avionics)</SelectItem>
                          <SelectItem value="Semua Kelas">Semua Kelas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="m-tipe">Tipe Materi</Label>
                      <Select
                        value={matForm.tipe}
                        onValueChange={(val) => setMatForm({ ...matForm, tipe: val || "" })}
                      >
                        <SelectTrigger id="m-tipe">
                          <SelectValue placeholder="Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Modul PDF">Modul PDF / Handout</SelectItem>
                          <SelectItem value="Video Praktik">Video Praktik / Simulasi</SelectItem>
                          <SelectItem value="Slide PPT">Slide Presentasi PPT</SelectItem>
                          <SelectItem value="SOP Hanggar">SOP Hanggar & Keselamatan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="m-file">URL File / Google Drive / Video</Label>
                      <Input
                        id="m-file"
                        placeholder="https://drive.google.com/..."
                        value={matForm.fileUrl}
                        onChange={(e) => setMatForm({ ...matForm, fileUrl: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="m-desk">Deskripsi Ringkas</Label>
                    <Textarea
                      id="m-desk"
                      rows={3}
                      placeholder="Petunjuk ringkas materi ini untuk siswa..."
                      value={matForm.deskripsi}
                      onChange={(e) => setMatForm({ ...matForm, deskripsi: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setMatDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={submittingMat} className="bg-navy-600 hover:bg-navy-700">
                    {submittingMat ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Simpan Materi
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Dialog Buat Tugas */}
          <Dialog open={assDialogOpen} onOpenChange={setAssDialogOpen}>
            <DialogTrigger
              render={
                <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-sm">
                  <FileCheck className="h-4 w-4" /> Buat Tugas Baru
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleCreateAssignment}>
                <DialogHeader>
                  <DialogTitle>Buat Tugas / Praktikum Baru</DialogTitle>
                  <DialogDescription>
                    Tugas akan dipublikasikan ke siswa beserta tenggat waktu pengumpulan.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="a-judul">Judul Tugas / Instruksi</Label>
                    <Input
                      id="a-judul"
                      placeholder="Contoh: Analisis Gaya Angkat Sayap Pesawat Boeing 737"
                      value={assForm.judul}
                      onChange={(e) => setAssForm({ ...assForm, judul: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="a-mapel">Mata Pelajaran</Label>
                      <Select
                        value={assForm.mapel}
                        onValueChange={(val) => setAssForm({ ...assForm, mapel: val || "" })}
                      >
                        <SelectTrigger id="a-mapel">
                          <SelectValue placeholder="Pilih mapel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aerodynamics & Flight Control">Aerodynamics & Flight Control</SelectItem>
                          <SelectItem value="Aircraft System & Powerplant">Aircraft System & Powerplant</SelectItem>
                          <SelectItem value="Aviation Electronics & Instruments">Aviation Electronics & Instruments</SelectItem>
                          <SelectItem value="Airframe Maintenance & Inspection">Airframe Maintenance & Inspection</SelectItem>
                          <SelectItem value="Aviation English Technical">Aviation English Technical</SelectItem>
                          <SelectItem value="Matematika Terapan">Matematika Terapan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="a-kelas">Target Kelas</Label>
                      <Select
                        value={assForm.kelas}
                        onValueChange={(val) => setAssForm({ ...assForm, kelas: val || "" })}
                      >
                        <SelectTrigger id="a-kelas">
                          <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="X-AP-1">X-AP-1 (Airframe Powerplant)</SelectItem>
                          <SelectItem value="X-EA-1">X-EA-1 (Electrical Avionics)</SelectItem>
                          <SelectItem value="XI-AP-1">XI-AP-1 (Airframe Powerplant)</SelectItem>
                          <SelectItem value="XI-EA-1">XI-EA-1 (Electrical Avionics)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="a-deadline">Tenggat Waktu Pengumpulan (Deadline)</Label>
                    <Input
                      id="a-deadline"
                      type="datetime-local"
                      value={assForm.tenggatWaktu}
                      onChange={(e) => setAssForm({ ...assForm, tenggatWaktu: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="a-desk">Rincian Instruksi / Ketentuan</Label>
                    <Textarea
                      id="a-desk"
                      rows={3}
                      placeholder="Jelaskan kriteria tugas, format file yang diunggah, dll..."
                      value={assForm.deskripsi}
                      onChange={(e) => setAssForm({ ...assForm, deskripsi: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAssDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={submittingAss} className="bg-amber-600 hover:bg-amber-700">
                    {submittingAss ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Terbitkan Tugas
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-muted p-1">
            <TabsTrigger value="materials" className="gap-2">
              <BookOpen className="h-4 w-4" /> Materi Ajar ({materials.length})
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <FileCheck className="h-4 w-4" /> Tugas & Praktik ({assignments.length})
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <GraduationCap className="h-4 w-4" /> Penilaian Siswa ({submissions.length})
            </TabsTrigger>
          </TabsList>

          {/* Filter kelas */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Filter Kelas:</span>
            <Select value={selectedKelas} onValueChange={(val) => setSelectedKelas(val || "all")}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                <SelectItem value="X-AP-1">X-AP-1</SelectItem>
                <SelectItem value="X-EA-1">X-EA-1</SelectItem>
                <SelectItem value="XI-AP-1">XI-AP-1</SelectItem>
                <SelectItem value="XI-EA-1">XI-EA-1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* TAB 1: MATERI */}
        <TabsContent value="materials" className="space-y-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
            </div>
          ) : filteredMaterials.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-3">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto stroke-1" />
                <h3 className="text-lg font-semibold text-foreground">Belum ada materi pembelajaran</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Silakan klik tombol &quot;Unggah Materi&quot; di atas untuk menambahkan bahan modul PDF, video praktikum, atau SOP hanggar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.map((mat) => (
                <Card key={mat.id} className="border-border/60 hover:shadow-md transition-all flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs bg-navy-50 text-navy-700 border-navy-200">
                        {mat.kelas}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800 text-[11px] hover:bg-amber-100 border-none">
                        {mat.tipe}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2 mt-2">{mat.judul}</CardTitle>
                    <CardDescription className="text-xs font-medium text-navy-600">
                      {mat.mapel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {mat.deskripsi || "Tidak ada deskripsi tambahan."}
                    </p>
                    <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Oleh: {mat.guruNama}</span>
                      {mat.fileUrl && mat.fileUrl !== "#" ? (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-navy-600 hover:text-navy-800 font-medium"
                        >
                          Buka Berkas <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">File offline</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: TUGAS */}
        <TabsContent value="assignments" className="space-y-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
            </div>
          ) : filteredAssignments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-3">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto stroke-1" />
                <h3 className="text-lg font-semibold text-foreground">Belum ada tugas aktif</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Gunakan tombol &quot;Buat Tugas Baru&quot; untuk memberikan latihan, jobsheet praktikum hanggar, atau evaluasi mandiri.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAssignments.map((ass) => (
                <Card key={ass.id} className="border-border/60 hover:shadow-md transition-all flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline" className="text-xs bg-navy-50 text-navy-700 border-navy-200">
                        {ass.kelas}
                      </Badge>
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-[11px] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ass.tenggatWaktu).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2 mt-2">{ass.judul}</CardTitle>
                    <CardDescription className="text-xs font-medium text-navy-600">
                      {ass.mapel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {ass.deskripsi || "Instruksi umum pengerjaan tugas."}
                    </p>
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Oleh: {ass.guruNama}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-navy-600 hover:text-navy-800 h-7 px-2"
                        onClick={() => {
                          setSelectedAssignmentId(ass.id);
                          setActiveTab("submissions");
                        }}
                      >
                        Periksa Jawaban →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: PENILAIAN PENGUMPULAN */}
        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base">Daftar Pengumpulan Tugas Siswa</CardTitle>
                  <CardDescription>
                    Periksa hasil pekerjaan siswa, berikan nilai skor (0-100) dan umpan balik pembinaan.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Filter Tugas:</span>
                  <Select value={selectedAssignmentId} onValueChange={(val) => setSelectedAssignmentId(val || "all")}>
                    <SelectTrigger className="w-[240px] h-9 text-xs">
                      <SelectValue placeholder="Pilih Tugas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tugas</SelectItem>
                      {assignments.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.judul.substring(0, 32)}... ({a.kelas})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-navy-500" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Belum ada siswa yang mengumpulkan tugas ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Siswa</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Waktu Kirim</TableHead>
                        <TableHead>Berkas / Jawaban</TableHead>
                        <TableHead className="w-[120px]">Nilai (0-100)</TableHead>
                        <TableHead>Catatan Guru / Feedback</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((sub) => {
                        const scoreState = gradingScores[sub.id] || {
                          nilai: sub.nilai !== null ? String(sub.nilai) : "",
                          feedback: sub.feedback || "",
                        };
                        const isGraded = sub.nilai !== null;

                        return (
                          <TableRow key={sub.id}>
                            <TableCell>
                              <div className="font-medium text-sm text-navy-950">{sub.namaSiswa}</div>
                              <div className="text-xs text-muted-foreground font-mono">NIS: {sub.nis}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{sub.kelas}</Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(sub.submittedAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                {sub.catatan || "Tidak ada catatan"}
                              </div>
                              {sub.fileUrl && sub.fileUrl !== "#" ? (
                                <a
                                  href={sub.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-navy-600 hover:underline mt-1 font-medium"
                                >
                                  Lampiran Tugas <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">File dikirim langsung</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                placeholder="0-100"
                                value={scoreState.nilai}
                                onChange={(e) =>
                                  setGradingScores((prev) => ({
                                    ...prev,
                                    [sub.id]: { ...scoreState, nilai: e.target.value },
                                  }))
                                }
                                className="h-8 w-20 text-center font-bold"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Feedback untuk siswa..."
                                value={scoreState.feedback}
                                onChange={(e) =>
                                  setGradingScores((prev) => ({
                                    ...prev,
                                    [sub.id]: { ...scoreState, feedback: e.target.value },
                                  }))
                                }
                                className="h-8 min-w-[180px] text-xs"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                disabled={savingGradeId === sub.id}
                                onClick={() => handleSaveGrade(sub.id)}
                                className={`h-8 gap-1 text-xs ${
                                  isGraded
                                    ? "bg-navy-600 hover:bg-navy-700 text-white"
                                    : "bg-amber-600 hover:bg-amber-700 text-white"
                                }`}
                              >
                                {savingGradeId === sub.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Save className="h-3.5 w-3.5" />
                                )}
                                {isGraded ? "Update" : "Simpan"}
                              </Button>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
