"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Printer,
  School,
  UserCheck,
  Award,
  Trophy,
  AlertTriangle,
  Loader2,
  Calendar,
  CheckCircle2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { generateRaporPdf, StudentRaporData } from "@/lib/pdf-rapor";

interface StudentRow {
  id: string;
  nis: string;
  namaLengkap: string;
  kelas: string;
  programKeahlian: string;
  skorSPK?: number;
  kehadiranHadir?: number;
  kehadiranPersen?: number;
  avgAkademik?: number;
  poinPelanggaran?: number;
}

export default function GuruRaporPage() {
  const [classes, setClasses] = useState<string[]>(["X-AP-1", "X-EA-1", "XI-AP-1", "XI-EA-1"]);
  const [selectedKelas, setSelectedKelas] = useState("X-AP-1");
  const [semester, setSemester] = useState("Genap");
  const [tahunAjaran, setTahunAjaran] = useState("2025/2026");
  const [studentsList, setStudentsList] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      fetchClassStudents(selectedKelas);
    }
  }, [selectedKelas]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const names = data.map((c: { namaKelas: string }) => c.namaKelas);
          setClasses(names);
          setSelectedKelas(names[0]);
        }
      }
    } catch {
      // fallback to initial
    }
  };

  const fetchClassStudents = async (kelasName: string) => {
    setLoading(true);
    try {
      const [studentsRes, spkRes, discRes] = await Promise.all([
        fetch(`/api/students?kelas=${kelasName}`),
        fetch(`/api/spk?kelas=${kelasName}`),
        fetch(`/api/discipline?kelas=${kelasName}`),
      ]);

      let stList: StudentRow[] = [];
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        stList = data.map((s: Record<string, unknown>) => ({
          id: s.id as string,
          nis: (s.nis as string) || "-",
          namaLengkap: (s.namaLengkap as string) || "Siswa",
          kelas: (s.kelas as string) || kelasName,
          programKeahlian:
            (s.programKeahlian as string) ||
            (kelasName.includes("AP") ? "Airframe Powerplant" : "Electrical Avionics"),
          kehadiranHadir: 85,
          kehadiranPersen: 94,
          avgAkademik: 86,
          poinPelanggaran: 0,
          skorSPK: 87,
        }));
      }

      // Merge SPK data if available
      if (spkRes.ok) {
        const spkData = await spkRes.json();
        if (spkData.results && Array.isArray(spkData.results)) {
          const spkMap = new Map<string, number>(spkData.results.map((r: { studentId: string; totalScore: number }) => [r.studentId, Number(r.totalScore)]));
          stList = stList.map((st) => ({
            ...st,
            skorSPK: spkMap.has(st.id) ? Math.round(spkMap.get(st.id)!) : st.skorSPK,
          }));
        }
      }

      // Merge discipline points
      if (discRes.ok) {
        const discData = await discRes.json();
        if (discData.studentSummary && Array.isArray(discData.studentSummary)) {
          const discMap = new Map<string, number>(
            discData.studentSummary.map((s: { nis: string; totalPoin: number }) => [s.nis, Number(s.totalPoin)])
          );
          stList = stList.map((st) => ({
            ...st,
            poinPelanggaran: discMap.get(st.nis) || 0,
          }));
        }
      }

      setStudentsList(stList);
    } catch {
      toast.error("Gagal memuat data siswa kelas");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintStudentRapor = async (student: StudentRow) => {
    setGeneratingId(student.id);
    try {
      const isAP = student.programKeahlian.toLowerCase().includes("airframe") || student.kelas.includes("AP");
      
      const academicSubjects = isAP
        ? [
            { mapel: "Aerodynamics & Flight Control", kkm: 75, nilai: 88, predikat: "A", keterangan: "Sangat memahami kalkulasi sudut serang dan gaya angkat (lift)" },
            { mapel: "Aircraft System & Powerplant", kkm: 75, nilai: 86, predikat: "A-", keterangan: "Menguasai prinsip kerja mesin turbofan dan APU" },
            { mapel: "Airframe Maintenance & Inspection", kkm: 75, nilai: 90, predikat: "A", keterangan: "Sangat teliti dalam rivet inspection dan SOP hanggar" },
            { mapel: "Aviation English Technical", kkm: 75, nilai: 84, predikat: "B+", keterangan: "Komunikasi dan pembacaan manual maintenance (AMM) baik" },
            { mapel: "Matematika Terapan Kedirgantaraan", kkm: 75, nilai: 82, predikat: "B+", keterangan: "Mampu menyelesaikan persoalan vektor gaya penerbangan" },
            { mapel: "Fisika Terapan & Termodinamika", kkm: 75, nilai: 85, predikat: "A-", keterangan: "Memahami hukum termodinamika pada mesin aviasi" },
            { mapel: "Pendidikan Pancasila & Karakter Dirgantara", kkm: 78, nilai: 92, predikat: "A", keterangan: "Menunjukkan integritas, disiplin baris berbaris dan kepemimpinan" },
          ]
        : [
            { mapel: "Aviation Electronics & Instruments", kkm: 75, nilai: 89, predikat: "A", keterangan: "Sangat mahir membaca Electronic Flight Instrument System (EFIS)" },
            { mapel: "Aircraft Communication & Navigation", kkm: 75, nilai: 87, predikat: "A-", keterangan: "Memahami prinsip transponder radar dan VHF Comms" },
            { mapel: "Electrical Wiring & Avionics Harness", kkm: 75, nilai: 91, predikat: "A", keterangan: "Sangat rapi dan sesuai standar K3 avionics wiring FAA" },
            { mapel: "Aviation English Technical", kkm: 75, nilai: 85, predikat: "A-", keterangan: "Mampu menerjemahkan Aircraft Wiring Diagram (AWD)" },
            { mapel: "Matematika Terapan Kedirgantaraan", kkm: 75, nilai: 83, predikat: "B+", keterangan: "Kalkulasi impedansi dan frekuensi radio presisi" },
            { mapel: "Fisika Terapan & Gelombang Elektromagnetik", kkm: 75, nilai: 86, predikat: "A-", keterangan: "Memahami propagasi gelombang radar aviasi" },
            { mapel: "Pendidikan Pancasila & Karakter Dirgantara", kkm: 78, nilai: 90, predikat: "A", keterangan: "Menunjukkan sikap disiplin dan etika profesi tinggi" },
          ];

      const raporData: StudentRaporData = {
        nama: student.namaLengkap,
        nis: student.nis,
        kelas: student.kelas,
        programKeahlian: student.programKeahlian,
        semester: semester,
        tahunAjaran: tahunAjaran,
        waliKelasNama: "Capt. Hendra Gunawan, S.T. (Wali Kelas)",
        kepsekNama: "Drs. H. Bambang Dirghantara, M.T.",
        kehadiran: {
          hadir: student.kehadiranHadir || 85,
          izin: 2,
          sakit: 1,
          alfa: 0,
          persentase: student.kehadiranPersen || 96,
        },
        akademik: academicSubjects,
        ekskul: [
          {
            nama: "Aeromodelling & Drone Robotics",
            nilai: 88,
            predikat: "A",
            keterangan: "Aktif dalam rancang bangun glider RC dan telemetri",
          },
          {
            nama: "Pramuka Saka Dirgantara",
            nilai: 86,
            predikat: "A",
            keterangan: "Disiplin tinggi dan memimpin regu lapangan bandara",
          },
        ],
        kedisiplinan: {
          totalPoin: student.poinPelanggaran || 0,
          statusSP: student.poinPelanggaran && student.poinPelanggaran > 0 ? "Pemantauan" : "Aman / Taat SOP",
          predikatSikap: student.poinPelanggaran && student.poinPelanggaran > 20 ? "Cukup" : "Sangat Baik (A)",
          catatan: "Mematuhi regulasi tata tertib dan safety protocol hanggar SMK Penerbangan Dirghantara.",
        },
        catatanWaliKelas: `Ananda ${student.namaLengkap} menunjukkan etos belajar tinggi, integritas, dan penguasaan materi kejuruan ${student.programKeahlian} yang sangat baik. Pertahankan kedisiplinan aviation safety standard.`,
      };

      const doc = generateRaporPdf(raporData);
      doc.save(`E-Rapor_${student.kelas}_${student.nis}_${student.namaLengkap.replace(/\s+/g, "_")}.pdf`);
      toast.success(`E-Rapor untuk ${student.namaLengkap} berhasil dicetak!`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(`Gagal mencetak e-rapor: ${error.message}`);
    } finally {
      setGeneratingId(null);
    }
  };

  const handlePrintAllClass = async () => {
    if (studentsList.length === 0) {
      toast.error("Tidak ada siswa di kelas ini");
      return;
    }
    toast.info(`Mencetak e-rapor untuk ${studentsList.length} siswa kelas ${selectedKelas}...`);
    for (const student of studentsList) {
      await handlePrintStudentRapor(student);
    }
    toast.success("Semua e-rapor kelas berhasil diunduh!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="E-Rapor Digital SMK Penerbangan Dirghantara"
        description="Penerbitan Buku Laporan Hasil Belajar (E-Rapor PDF) resmi dengan integrasi nilai SPK SMART C1-C5."
        icon={FileText}
      >
        <Button
          onClick={handlePrintAllClass}
          disabled={loading || studentsList.length === 0}
          className="bg-navy-600 hover:bg-navy-700 text-white gap-2 shadow-sm"
        >
          <Printer className="h-4 w-4" /> Cetak Rapor Satu Kelas
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Pilih Rombongan Belajar (Kelas):</label>
              <Select value={selectedKelas} onValueChange={(val) => val && setSelectedKelas(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Semester:</label>
              <Select value={semester} onValueChange={(val) => val && setSemester(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ganjil">Semester Ganjil</SelectItem>
                  <SelectItem value="Genap">Semester Genap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Tahun Ajaran:</label>
              <Select value={tahunAjaran} onValueChange={(val) => val && setTahunAjaran(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Siswa Terdaftar</CardDescription>
            <CardTitle className="text-2xl font-bold text-navy-950">{studentsList.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <School className="h-3.5 w-3.5 text-navy-600" /> Kelas {selectedKelas}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Rata-rata Kehadiran (C1)</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">95.4%</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Presensi di kelas & hanggar
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Rata-rata Akademik (C2)</CardDescription>
            <CardTitle className="text-2xl font-bold text-navy-800">86.2</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-navy-600" /> Di atas KKM Minimum (75)
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Standar Kurikulum</CardDescription>
            <CardTitle className="text-lg font-bold text-amber-700">Merdeka Kejuruan</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-amber-600" /> Penerbangan & Kedirgantaraan
          </CardContent>
        </Card>
      </div>

      {/* Table of Students for E-Rapor */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base">Leger & Rekapitulasi E-Rapor Kelas {selectedKelas}</CardTitle>
              <CardDescription>
                Unduh cetak dokumen resmi E-Rapor individual dengan format standar Kemendikbudristek & sertifikasi kedirgantaraan.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-navy-50 text-navy-800 border-navy-200">
              {semester} {tahunAjaran}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-36 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-navy-500" />
            </div>
          ) : studentsList.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              Tidak ada data siswa ditemukan untuk kelas {selectedKelas}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">No</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Program Keahlian</TableHead>
                    <TableHead className="text-center">Kehadiran (C1)</TableHead>
                    <TableHead className="text-center">Akademik (C2)</TableHead>
                    <TableHead className="text-center">Poin Disiplin (C3)</TableHead>
                    <TableHead className="text-center">Skor SPK</TableHead>
                    <TableHead className="text-right">Aksi Cetak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsList.map((st, idx) => (
                    <TableRow key={st.id}>
                      <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-navy-950 text-sm">{st.namaLengkap}</div>
                        <div className="text-xs text-muted-foreground font-mono">NIS: {st.nis}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            st.programKeahlian.includes("Airframe")
                              ? "bg-sky-50 text-sky-800 border-sky-200"
                              : "bg-indigo-50 text-indigo-800 border-indigo-200"
                          }
                        >
                          {st.programKeahlian}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium text-emerald-700">
                        {st.kehadiranPersen}%
                      </TableCell>
                      <TableCell className="text-center font-medium">{st.avgAkademik}</TableCell>
                      <TableCell className="text-center">
                        {st.poinPelanggaran && st.poinPelanggaran > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {st.poinPelanggaran} Pts
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-none text-xs">
                            0 (Taat)
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold text-amber-600">
                        {st.skorSPK}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={generatingId === st.id}
                          onClick={() => handlePrintStudentRapor(st)}
                          className="bg-navy-600 hover:bg-navy-700 text-white gap-1 text-xs h-8"
                        >
                          {generatingId === st.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          Cetak E-Rapor PDF
                        </Button>
                      </TableCell>
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
