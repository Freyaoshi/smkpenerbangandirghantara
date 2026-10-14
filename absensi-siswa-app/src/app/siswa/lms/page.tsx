"use client";

import { useState, useEffect } from "react";
import {
  Laptop,
  BookOpen,
  FileCheck,
  Clock,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Loader2,
  Search,
  Calendar,
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  catatan: string | null;
  fileUrl: string | null;
  nilai: number | null;
  feedback: string | null;
  submittedAt: string;
}

export default function SiswaLmsPage() {
  const [activeTab, setActiveTab] = useState("materials");
  const [materials, setMaterials] = useState<LmsMaterial[]>([]);
  const [assignments, setAssignments] = useState<LmsAssignment[]>([]);
  const [mySubmissions, setMySubmissions] = useState<LmsSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<{ id: string; kelas: string } | null>(null);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("all");

  // Submit modal
  const [selectedAssignment, setSelectedAssignment] = useState<LmsAssignment | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    catatan: "",
    fileUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const meRes = await fetch("/api/students/me");
        if (meRes.ok) {
          const me = await meRes.json();
          setStudentProfile(me);

          // Fetch materials & assignments filtered by class
          const [matRes, assRes, subRes] = await Promise.all([
            fetch(`/api/lms/materials?kelas=${me.kelas}`),
            fetch(`/api/lms/assignments?kelas=${me.kelas}`),
            fetch(`/api/lms/submissions?studentId=${me.id}`),
          ]);

          if (matRes.ok) setMaterials(await matRes.json());
          if (assRes.ok) setAssignments(await assRes.json());
          if (subRes.ok) setMySubmissions(await subRes.json());
        }
      } catch {
        toast.error("Gagal memuat materi LMS");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !studentProfile) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/lms/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          assignmentId: selectedAssignment.id,
          studentId: studentProfile.id,
          catatan: submitForm.catatan,
          fileUrl: submitForm.fileUrl || "#",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengirim tugas");
      }

      toast.success("Tugas berhasil dikirim ke dewan guru!");
      setSubmitDialogOpen(false);
      setSubmitForm({ catatan: "", fileUrl: "" });

      // Refresh submissions
      const subRes = await fetch(`/api/lms/submissions?studentId=${studentProfile.id}`);
      if (subRes.ok) setMySubmissions(await subRes.json());
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submissionMap = new Map(mySubmissions.map((s) => [s.assignmentId, s]));

  const filteredMaterials = materials.filter((m) => {
    const matchSearch =
      m.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.deskripsi && m.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchMapel = selectedMapel === "all" || m.mapel === selectedMapel;
    return matchSearch && matchMapel;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="LMS Pembelajaran & Praktikum"
        description="Akses modul ajar kedirgantaraan, unduh panduan materi praktikum hanggar, dan kumpulkan tugas mandiri."
        icon={Laptop}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="materials" className="gap-2">
            <BookOpen className="h-4 w-4" /> Modul & Materi Ajar ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <FileCheck className="h-4 w-4" /> Tugas & Praktikum ({assignments.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MATERI */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari materi pembelajaran..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    Mata Pelajaran:
                  </span>
                  <Select value={selectedMapel} onValueChange={(val) => setSelectedMapel(val || "all")}>
                    <SelectTrigger className="w-[200px] h-9 text-xs">
                      <SelectValue placeholder="Pilih Mapel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                      <SelectItem value="Aerodynamics & Flight Control">Aerodynamics</SelectItem>
                      <SelectItem value="Aircraft System & Powerplant">Powerplant</SelectItem>
                      <SelectItem value="Aviation Electronics & Instruments">Electronics</SelectItem>
                      <SelectItem value="Airframe Maintenance & Inspection">Airframe</SelectItem>
                      <SelectItem value="Aviation English Technical">Technical English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
            </div>
          ) : filteredMaterials.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-3">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto stroke-1" />
                <h3 className="text-lg font-semibold text-foreground">Belum ada materi tersedia</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Materi untuk kelas Anda akan muncul di sini setelah diunggah oleh guru pengampu.
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
                        {mat.mapel}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800 text-[11px] border-none">
                        {mat.tipe}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2 mt-2">{mat.judul}</CardTitle>
                    <CardDescription className="text-xs">
                      Pengampu: {mat.guruNama}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {mat.deskripsi || "Silakan unduh atau pelajari modul materi ini."}
                    </p>
                    <div className="pt-2 border-t flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground">Kelas {mat.kelas}</span>
                      {mat.fileUrl && mat.fileUrl !== "#" ? (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-navy-600 hover:text-navy-800"
                        >
                          Buka Materi <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">Tersedia di Kelas</span>
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
          ) : assignments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-3">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto stroke-1" />
                <h3 className="text-lg font-semibold text-foreground">Tidak ada tugas aktif</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Semua tugas mandiri atau jobsheet praktikum telah selesai atau belum ditugaskan.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignments.map((ass) => {
                const sub = submissionMap.get(ass.id);
                const isSubmitted = !!sub;
                const isGraded = isSubmitted && sub.nilai !== null;

                return (
                  <Card key={ass.id} className="border-border/60 hover:shadow-md transition-all flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className="text-xs bg-navy-50 text-navy-700 border-navy-200">
                          {ass.mapel}
                        </Badge>
                        {isGraded ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-none text-xs gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Nilai: {sub.nilai}/100
                          </Badge>
                        ) : isSubmitted ? (
                          <Badge className="bg-sky-100 text-sky-800 border-none text-xs gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Sudah Dikirim
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-700 border-red-200 text-xs gap-1">
                            <Clock className="h-3.5 w-3.5" /> Belum Dikumpulkan
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base line-clamp-2 mt-2">{ass.judul}</CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" /> Tenggat:{" "}
                        {new Date(ass.tenggatWaktu).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {ass.deskripsi || "Kerjakan sesuai instruksi guru pengampu."}
                      </p>

                      {/* Feedback box if graded */}
                      {isGraded && sub.feedback && (
                        <div className="p-2.5 rounded bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                          <div className="font-semibold text-emerald-900 flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" /> Catatan Guru:
                          </div>
                          <div className="text-emerald-800">{sub.feedback}</div>
                        </div>
                      )}

                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Oleh: {ass.guruNama}</span>
                        {isSubmitted ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8"
                            onClick={() => {
                              setSelectedAssignment(ass);
                              setSubmitForm({
                                catatan: sub.catatan || "",
                                fileUrl: sub.fileUrl || "",
                              });
                              setSubmitDialogOpen(true);
                            }}
                          >
                            Kirim Ulang
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-navy-600 hover:bg-navy-700 text-white text-xs h-8 gap-1"
                            onClick={() => {
                              setSelectedAssignment(ass);
                              setSubmitForm({ catatan: "", fileUrl: "" });
                              setSubmitDialogOpen(true);
                            }}
                          >
                            <Upload className="h-3.5 w-3.5" /> Kumpulkan Tugas
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Assignment Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmitAssignment}>
            <DialogHeader>
              <DialogTitle>Kumpulkan Jawaban Tugas</DialogTitle>
              <DialogDescription>
                {selectedAssignment?.judul} ({selectedAssignment?.mapel})
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sub-link">Tautan File Tugas (Google Drive / GitHub / URL Berkas)</Label>
                <Input
                  id="sub-link"
                  placeholder="https://drive.google.com/..."
                  value={submitForm.fileUrl}
                  onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value })}
                  required
                />
                <span className="text-[11px] text-muted-foreground">
                  Pastikan akses link berkas telah dibuka (Anyone with link can view).
                </span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sub-catatan">Catatan / Jawaban Tambahan</Label>
                <Textarea
                  id="sub-catatan"
                  rows={3}
                  placeholder="Tuliskan catatan ringkas untuk guru..."
                  value={submitForm.catatan}
                  onChange={(e) => setSubmitForm({ ...submitForm, catatan: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubmitDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-navy-600 hover:bg-navy-700 text-white gap-1">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Kirimkan Sekarang
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
