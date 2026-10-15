"use client";

import { useState, useEffect, useRef } from "react";
import {
  Megaphone,
  PlusCircle,
  Search,
  Calendar,
  AlertCircle,
  Trash2,
  CheckCircle,
  Loader2,
  RefreshCw,
  Tag,
  ImageIcon,
  UploadCloud,
  X,
  ZoomIn,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AnnouncementItem {
  id: string;
  judul: string;
  kategori: string;
  konten: string;
  prioritas: string;
  tanggalMulai?: string;
  tanggalSelesai?: string | null;
  imageUrl?: string | null;
  authorName: string;
  createdAt: string;
}

export default function AdminMadingPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog Form
  const [openDialog, setOpenDialog] = useState(false);
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState("Agenda Sekolah");
  const [konten, setKonten] = useState("");
  const [prioritas, setPrioritas] = useState("Normal");
  const [submitting, setSubmitting] = useState(false);

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox Preview State
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    } catch {
      toast.error("Gagal memuat mading");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, WebP, GIF, SVG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5 MB");
      return;
    }

    setSelectedImage(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !konten) {
      toast.error("Judul dan isi pengumuman wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrl: string | null = null;

      if (selectedImage) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append("file", selectedImage);

        const uploadRes = await fetch("/api/announcements/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Gagal mengunggah gambar");
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.imageUrl;
        setIsUploadingImage(false);
      }

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          kategori,
          konten,
          prioritas,
          imageUrl: uploadedImageUrl,
        }),
      });

      if (res.ok) {
        toast.success("Pengumuman berhasil dipublikasikan!");
        setOpenDialog(false);
        setJudul("");
        setKonten("");
        handleRemoveImage();
        fetchAnnouncements();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal mempublikasikan");
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Pengumuman berhasil dihapus");
        fetchAnnouncements();
      }
    } catch {
      toast.error("Gagal menghapus pengumuman");
    }
  };

  const filtered = announcements.filter(
    (a) =>
      a.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.konten.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/20 p-2.5 backdrop-blur-md">
              <Megaphone className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Mading & Pengumuman Sekolah Digital (Modul G)
              </h1>
              <p className="text-xs text-navy-200">
                Pusat publikasi informasi resmi, jadwal apel kedirgantaraan, surat edaran, dan prestasi siswa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAnnouncements}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Segarkan
            </Button>
            <Dialog open={openDialog} onOpenChange={(open) => {
              setOpenDialog(open);
              if (!open) handleRemoveImage();
            }}>
              <DialogTrigger render={
                <Button size="sm" className="bg-amber-500 text-navy-950 hover:bg-amber-400 font-semibold shadow-md">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Buat Pengumuman Baru
                </Button>
              } />
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Publikasi Pengumuman Mading</DialogTitle>
                  <DialogDescription className="text-xs">
                    Pengumuman ini dapat dibaca oleh seluruh warga sekolah (Dewan Guru, Siswa, dan Staf)
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Judul Pengumuman</Label>
                    <Input
                      placeholder="Contoh: Apel Akbar Hari Kedirgantaraan..."
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Kategori</Label>
                      <select
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        <option value="Agenda Sekolah">Agenda Sekolah</option>
                        <option value="Apel Kedirgantaraan">Apel Kedirgantaraan</option>
                        <option value="Surat Edaran">Surat Edaran</option>
                        <option value="Prestasi Siswa">Prestasi Siswa</option>
                        <option value="Akademik">Akademik</option>
                        <option value="SOP Hanggar">SOP Hanggar</option>
                        <option value="Kedisiplinan">Kedisiplinan</option>
                        <option value="Ekstrakurikuler">Ekstrakurikuler</option>
                        <option value="Umum">Umum</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Tingkat Prioritas</Label>
                      <select
                        value={prioritas}
                        onChange={(e) => setPrioritas(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Penting">Penting</option>
                        <option value="Urgent">Mendesak / Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Image Upload Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-amber-500" />
                        Unggah Foto / Poster / Banner (Opsional)
                      </Label>
                      {selectedImage && (
                        <span className="text-[11px] text-muted-foreground">
                          {(selectedImage.size / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      id="mading-image-upload"
                    />

                    {imagePreview ? (
                      <div className="relative rounded-lg border border-border bg-muted/40 p-2 overflow-hidden group">
                        <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-md bg-black/5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imagePreview}
                            alt="Preview unggahan"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 px-1">
                          <span className="truncate text-xs font-medium text-foreground max-w-[240px]">
                            {selectedImage?.name}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={handleRemoveImage}
                            className="h-7 px-2.5 text-xs"
                          >
                            <Trash2 className="mr-1.5 h-3 w-3" />
                            Hapus Foto
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-5 text-center cursor-pointer hover:border-amber-500/50 hover:bg-amber-50/10 transition-colors"
                      >
                        <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          Klik untuk memilih foto atau seret ke sini
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Mendukung JPG, PNG, WEBP, GIF, atau SVG (Maks. 5 MB)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Konten Informasi</Label>
                    <Textarea
                      placeholder="Tuliskan isi pengumuman secara rinci..."
                      rows={4}
                      value={konten}
                      onChange={(e) => setKonten(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={submitting || isUploadingImage} className="bg-navy-700 text-white hover:bg-navy-800">
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isUploadingImage ? "Mengunggah Gambar..." : "Mempublikasikan..."}
                        </>
                      ) : (
                        "Publikasikan"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari pengumuman..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Announcements Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((item) => (
          <Card key={item.id} className="border-border/60 shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between">
            <div>
              {/* Image Banner if available */}
              {item.imageUrl && (
                <div
                  onClick={() => setLightboxImage({ url: item.imageUrl!, title: item.judul })}
                  className="relative aspect-video max-h-52 w-full overflow-hidden bg-slate-900 group cursor-pointer border-b border-border/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.judul}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-medium backdrop-blur-[2px]">
                    <ZoomIn className="h-4 w-4 text-amber-400" />
                    <span>Klik untuk memperbesar</span>
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={
                      item.kategori.includes("Apel")
                        ? "border-amber-500 text-amber-700 bg-amber-50"
                        : item.kategori.includes("Prestasi")
                        ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                        : "border-navy-300 text-navy-800 bg-navy-50"
                    }
                  >
                    {item.kategori}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        item.prioritas === "Urgent"
                          ? "bg-red-600 text-white text-[10px]"
                          : item.prioritas === "Penting"
                          ? "bg-amber-600 text-white text-[10px]"
                          : "bg-slate-200 text-slate-700 text-[10px]"
                      }
                    >
                      {item.prioritas}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-base font-semibold mt-2">{item.judul}</CardTitle>
                <CardDescription className="text-[11px]">
                  Dipublikasikan oleh {item.authorName} • {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed">
                  {item.konten}
                </p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* Lightbox Preview Modal */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-none text-white overflow-hidden shadow-2xl">
          <div className="flex flex-col items-center justify-center p-2">
            <div className="w-full flex items-center justify-between pb-2 px-2 text-xs text-white/80 border-b border-white/10 mb-2">
              <span className="font-semibold text-white truncate max-w-[80%]">
                {lightboxImage?.title}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setLightboxImage(null)}
                className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {lightboxImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[80vh] w-auto max-w-full rounded-md object-contain shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
