"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  BookMarked,
  PlusCircle,
  Search,
  CheckCircle,
  ArrowRightLeft,
  Calendar,
  Layers,
  Loader2,
  RefreshCw,
  Library,
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

export default function PerpustakaanPage() {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog Add Book
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [bKode, setBKode] = useState("");
  const [bJudul, setBJudul] = useState("");
  const [bPengarang, setBPengarang] = useState("");
  const [bPenerbit, setBPenerbit] = useState("");
  const [bTahun, setBTahun] = useState("2024");
  const [bKategori, setBKategori] = useState("Kejuruan AP");
  const [bStok, setBStok] = useState(3);
  const [bRak, setBRak] = useState("Rak AP-1");
  const [submittingBook, setSubmittingBook] = useState(false);

  // Dialog Loan
  const [openLoanDialog, setOpenLoanDialog] = useState(false);
  const [loanBookId, setLoanBookId] = useState("");
  const [loanStudentId, setLoanStudentId] = useState("");
  const [loanDays, setLoanDays] = useState(7);
  const [submittingLoan, setSubmittingLoan] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resLib, resStudents] = await Promise.all([
        fetch("/api/library"),
        fetch("/api/students"),
      ]);

      if (resLib.ok) {
        const lData = await resLib.json();
        setBooks(lData.books || []);
        setLoans(lData.loans || []);
      }
      if (resStudents.ok) setAllStudents(await resStudents.json());
    } catch {
      toast.error("Gagal memuat data perpustakaan");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBook(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_book",
          kodeBuku: bKode,
          judul: bJudul,
          pengarang: bPengarang,
          penerbit: bPenerbit,
          tahun: bTahun,
          kategori: bKategori,
          totalStok: bStok,
          lokasiRak: bRak,
        }),
      });

      if (res.ok) {
        toast.success("Buku baru berhasil ditambahkan!");
        setOpenBookDialog(false);
        setBKode("");
        setBJudul("");
        setBPengarang("");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menambah buku");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmittingBook(false);
    }
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanBookId || !loanStudentId) {
      toast.error("Pilih buku dan siswa");
      return;
    }
    setSubmittingLoan(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "borrow",
          bookId: loanBookId,
          studentId: loanStudentId,
          durasiHari: loanDays,
        }),
      });
      if (res.ok) {
        toast.success("Peminjaman buku berhasil dicatat!");
        setOpenLoanDialog(false);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal meminjam");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmittingLoan(false);
    }
  };

  const handleReturn = async (loanId: string) => {
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "return", loanId }),
      });
      if (res.ok) {
        toast.success("Buku berhasil dikembalikan!");
        fetchData();
      } else {
        toast.error("Gagal mengembalikan buku");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const filteredBooks = books.filter(
    (b) =>
      b.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.kodeBuku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-cyan-950 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/20 p-2.5 backdrop-blur-md">
              <BookOpen className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Perpustakaan Digital Aviasi (Modul H)
              </h1>
              <p className="text-xs text-navy-200">
                Katalogisasi buku kejuruan kedirgantaraan, modul aviasi, dan transaksi sirkulasi peminjaman
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

            {/* Dialog Form Pinjam */}
            <Dialog open={openLoanDialog} onOpenChange={setOpenLoanDialog}>
              <DialogTrigger render={
                <Button size="sm" className="bg-cyan-600 text-white hover:bg-cyan-700">
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Transaksi Pinjam
                </Button>
              }>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Transaksi Peminjaman Buku</DialogTitle>
                  <DialogDescription className="text-xs">
                    Catat peminjaman buku kejuruan oleh siswa SMK Penerbangan Dirghantara
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBorrow} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Pilih Buku (Tersedia)</Label>
                    <select
                      value={loanBookId}
                      onChange={(e) => setLoanBookId(e.target.value)}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="">-- Pilih Buku --</option>
                      {books
                        .filter((b) => b.stokTersedia > 0)
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            [{b.kodeBuku}] {b.judul} (Tersedia: {b.stokTersedia})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Pilih Siswa</Label>
                    <select
                      value={loanStudentId}
                      onChange={(e) => setLoanStudentId(e.target.value)}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="">-- Pilih Siswa --</option>
                      {allStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.namaLengkap} ({s.nis} - {s.kelas})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Durasi Peminjaman (Hari)</Label>
                    <Input
                      type="number"
                      value={loanDays}
                      onChange={(e) => setLoanDays(parseInt(e.target.value))}
                      className="text-xs"
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenLoanDialog(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={submittingLoan} className="bg-cyan-600 text-white">
                      {submittingLoan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Proses Peminjaman
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Dialog Add Book */}
            <Dialog open={openBookDialog} onOpenChange={setOpenBookDialog}>
              <DialogTrigger render={
                <Button size="sm" className="bg-amber-500 text-navy-950 hover:bg-amber-400 font-semibold">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Buku
                </Button>
              }>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tambah Koleksi Buku Baru</DialogTitle>
                  <DialogDescription className="text-xs">
                    Katalogisasi buku modul kejuruan atau referensi aviasi baru
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddBook} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Kode Buku</Label>
                      <Input
                        placeholder="Contoh: AV-004"
                        value={bKode}
                        onChange={(e) => setBKode(e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Kategori</Label>
                      <select
                        value={bKategori}
                        onChange={(e) => setBKategori(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                      >
                        <option value="Kejuruan AP">Kejuruan AP (Airframe Powerplant)</option>
                        <option value="Kejuruan EA">Kejuruan EA (Electrical Avionics)</option>
                        <option value="Aviasi Umum">Aviasi Umum / FAA</option>
                        <option value="Mata Pelajaran Umum">Mata Pelajaran Umum</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Judul Buku</Label>
                    <Input
                      placeholder="Judul lengkap buku..."
                      value={bJudul}
                      onChange={(e) => setBJudul(e.target.value)}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Pengarang</Label>
                      <Input
                        value={bPengarang}
                        onChange={(e) => setBPengarang(e.target.value)}
                        required
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Penerbit</Label>
                      <Input
                        value={bPenerbit}
                        onChange={(e) => setBPenerbit(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Total Stok</Label>
                      <Input
                        type="number"
                        min="1"
                        value={bStok}
                        onChange={(e) => setBStok(parseInt(e.target.value))}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Lokasi Rak</Label>
                      <Input
                        placeholder="Contoh: Rak AP-2"
                        value={bRak}
                        onChange={(e) => setBRak(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpenBookDialog(false)}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={submittingBook} className="bg-navy-700 text-white">
                      {submittingBook ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Simpan Buku
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Tabs defaultValue="katalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="katalog">Katalog Buku Aviasi</TabsTrigger>
          <TabsTrigger value="sirkulasi">Sirkulasi Peminjaman</TabsTrigger>
        </TabsList>

        {/* Tab 1: Katalog Buku */}
        <TabsContent value="katalog" className="space-y-4">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Daftar Buku Koleksi Perpustakaan</CardTitle>
                  <CardDescription className="text-xs">
                    Total {books.length} judul koleksi buku kejuruan penerbangan
                  </CardDescription>
                </div>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari judul, kode, atau kategori..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 text-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead>Kode</TableHead>
                      <TableHead>Judul Buku</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Pengarang / Penerbit</TableHead>
                      <TableHead>Ketersediaan Stok</TableHead>
                      <TableHead>Lokasi Rak</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBooks.map((b) => (
                      <TableRow key={b.id} className="text-xs">
                        <TableCell className="font-mono font-semibold text-navy-800">
                          {b.kodeBuku}
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-foreground">{b.judul}</p>
                          <p className="text-[11px] text-muted-foreground">Tahun: {b.tahun || "-"}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{b.kategori}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {b.pengarang} {b.penerbit ? `(${b.penerbit})` : ""}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-xs ${
                                b.stokTersedia > 0
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {b.stokTersedia} / {b.totalStok}
                            </span>
                            <span className="text-[10px] text-muted-foreground">tersedia</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-muted-foreground">{b.lokasiRak}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Sirkulasi Peminjaman */}
        <TabsContent value="sirkulasi" className="space-y-4">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Riwayat & Status Transaksi Peminjaman</CardTitle>
              <CardDescription className="text-xs">
                Pelacakan peminjaman buku oleh siswa SMK Penerbangan Dirghantara
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loans.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Belum ada transaksi peminjaman aktif.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 text-xs">
                        <TableHead>Peminjam</TableHead>
                        <TableHead>Buku yang Dipinjam</TableHead>
                        <TableHead>Tgl Pinjam</TableHead>
                        <TableHead>Tenggat Kembali</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((l) => (
                        <TableRow key={l.id} className="text-xs">
                          <TableCell>
                            <p className="font-semibold text-foreground">{l.namaSiswa}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              NIS: {l.nis} • {l.kelas}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-foreground">{l.judulBuku}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{l.kodeBuku}</p>
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">{l.tanggalPinjam}</TableCell>
                          <TableCell className="font-mono text-muted-foreground">{l.tenggatKembali}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                l.status === "Dipinjam"
                                  ? "bg-amber-600 text-white"
                                  : l.status === "Kembali"
                                  ? "bg-emerald-600 text-white"
                                  : "bg-red-600 text-white"
                              }
                            >
                              {l.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {l.status === "Dipinjam" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReturn(l.id)}
                                className="h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                              >
                                Kembalikan
                              </Button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-mono">
                                Selesai ({l.tanggalKembali || "-"})
                              </span>
                            )}
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
      </Tabs>
    </div>
  );
}
