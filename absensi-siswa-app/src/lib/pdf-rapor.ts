import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface StudentRaporData {
  nama: string;
  nis: string;
  kelas: string;
  programKeahlian: string;
  semester: string;
  tahunAjaran: string;
  waliKelasNama?: string;
  kepsekNama?: string;
  kehadiran: {
    hadir: number;
    izin: number;
    sakit: number;
    alfa: number;
    persentase: number;
  };
  akademik: Array<{
    mapel: string;
    kkm: number;
    nilai: number;
    predikat: string;
    keterangan: string;
  }>;
  ekskul: Array<{
    nama: string;
    nilai: number;
    predikat: string;
    keterangan: string;
  }>;
  kedisiplinan: {
    totalPoin: number;
    statusSP: string;
    predikatSikap: string;
    catatan: string;
  };
  catatanWaliKelas?: string;
}

export function generateRaporPdf(data: StudentRaporData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // --- KOP SURAT RESMI SMK PENERBANGAN DIRGHANTARA ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(24, 43, 73); // Navy color
  doc.text("YAYASAN PENERBANGAN DIRGHANTARA NUSANTARA", pageWidth / 2, 14, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("SMK PENERBANGAN DIRGHANTARA JAKARTA", pageWidth / 2, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("TERAKREDITASI 'A' (UNGGUL) | NPSN: 69978123 | NSS: 322016001089", pageWidth / 2, 25, { align: "center" });
  doc.text("Kawasan Bandara Halim Perdanakusuma, Jl. Protokol No. 45, Jakarta Timur 13610", pageWidth / 2, 29, { align: "center" });
  doc.text("Telp: (021) 80889123 | Email: smkpenerbangandirghantara@gmail.com | SIMESA Digital", pageWidth / 2, 33, { align: "center" });

  // Double line under letterhead
  doc.setDrawColor(24, 43, 73);
  doc.setLineWidth(0.8);
  doc.line(14, 36, pageWidth - 14, 36);
  doc.setLineWidth(0.3);
  doc.line(14, 37.2, pageWidth - 14, 37.2);

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("LAPORAN HASIL CAPAIAN KOMPETENSI BELAJAR (E-RAPOR DIGITAL)", pageWidth / 2, 43, { align: "center" });

  // Student Identity Box
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  const leftX = 14;
  const colMid = 110;
  let curY = 49;

  doc.text(`Nama Siswa   : ${data.nama}`, leftX, curY);
  doc.text(`Kelas / Rombel : ${data.kelas}`, colMid, curY);
  curY += 5;
  doc.text(`NIS / NISN   : ${data.nis}`, leftX, curY);
  doc.text(`Program Studi  : ${data.programKeahlian}`, colMid, curY);
  curY += 5;
  doc.text(`Semester     : ${data.semester}`, leftX, curY);
  doc.text(`Tahun Ajaran   : ${data.tahunAjaran}`, colMid, curY);
  curY += 5;

  // SECTION A: CAPAIAN AKADEMIK
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(24, 43, 73);
  doc.text("A. CAPAIAN KOMPETENSI AKADEMIK & KEJURUAN DIRGANTARA (C2)", leftX, curY + 2);

  const tableRows = data.akademik.map((item, idx) => [
    idx + 1,
    item.mapel,
    item.kkm,
    item.nilai,
    item.predikat,
    item.keterangan,
  ]);

  autoTable(doc, {
    startY: curY + 4,
    head: [["No", "Mata Pelajaran", "KKM", "Nilai", "Predikat", "Capaian Kompetensi"]],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [24, 43, 73],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 65 },
      2: { halign: "center", cellWidth: 14 },
      3: { halign: "center", cellWidth: 16, fontStyle: "bold" },
      4: { halign: "center", cellWidth: 16 },
      5: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  // Calculate next Y position after table
  // @ts-expect-error autoTable adds lastAutoTable on doc
  let nextY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 140;

  // Check if we need page break
  if (nextY > 210) {
    doc.addPage();
    nextY = 20;
  }

  // SECTION B: EKSTRAKURIKULER & PRESTASI (C4 & C5)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(24, 43, 73);
  doc.text("B. PENGEMBANGAN DIRI & PRESTASI KEDIRGANTARAAN (C4 & C5)", leftX, nextY);

  const ekskulRows = data.ekskul.length > 0
    ? data.ekskul.map((e, idx) => [idx + 1, e.nama, e.nilai, e.predikat, e.keterangan])
    : [["1", "Aeromodelling Club Dirghantara", "88", "A", "Sangat Aktif dalam pembuatan prototype glider"]];

  autoTable(doc, {
    startY: nextY + 2,
    head: [["No", "Kegiatan Ekstrakurikuler", "Skor", "Predikat", "Keterangan Keaktifan"]],
    body: ekskulRows,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { halign: "center", cellWidth: 16 },
      3: { halign: "center", cellWidth: 18 },
      4: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-expect-error autoTable adds lastAutoTable on doc
  nextY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : nextY + 30;

  // SECTION C: KEDISIPLINAN & PRESENSI (C1 & C3)
  if (nextY > 215) {
    doc.addPage();
    nextY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(24, 43, 73);
  doc.text("C. KEDISIPLINAN & KETIDAKHADIRAN (C1 & C3)", leftX, nextY);

  const statusRows = [
    ["1", "Kehadiran Efektif (C1)", `${data.kehadiran.hadir} Hari (${data.kehadiran.persentase}%)`, "Tingkat kehadiran di kelas & hanggar"],
    ["2", "Sakit (S)", `${data.kehadiran.sakit} Hari`, "Surat keterangan dokter terlampir"],
    ["3", "Izin (I)", `${data.kehadiran.izin} Hari`, "Pemberitahuan resmi dari orang tua"],
    ["4", "Tanpa Keterangan (A)", `${data.kehadiran.alfa} Hari`, "Ketidakhadiran tanpa surat keterangan"],
    ["5", "Poin Pelanggaran Buku Saku (C3)", `${data.kedisiplinan.totalPoin} Poin (Status: ${data.kedisiplinan.statusSP})`, `Sikap: ${data.kedisiplinan.predikatSikap}`],
  ];

  autoTable(doc, {
    startY: nextY + 2,
    head: [["No", "Indikator Presensi & Disiplin", "Jumlah / Hasil", "Keterangan Tambahan"]],
    body: statusRows,
    theme: "grid",
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { cellWidth: 65 },
      2: { cellWidth: 50, fontStyle: "bold" },
      3: { cellWidth: "auto" },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-expect-error autoTable adds lastAutoTable on doc
  nextY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : nextY + 40;

  // SECTION D: CATATAN WALI KELAS
  if (nextY > 230) {
    doc.addPage();
    nextY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(24, 43, 73);
  doc.text("D. CATATAN & REKOMENDASI WALI KELAS", leftX, nextY);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const catatanText = data.catatanWaliKelas ||
    `Ananda ${data.nama} menunjukkan kedisiplinan dan minat belajar tinggi khususnya dalam sesi praktikum hanggar kejuruan ${data.programKeahlian}. Pertahankan ketelitian K3 keselamatan kerja dirgantara dan tingkatkan terus prestasinya.`;
  
  doc.rect(leftX, nextY + 2, pageWidth - 28, 14);
  doc.text(catatanText, leftX + 3, nextY + 7, { maxWidth: pageWidth - 34 });

  nextY += 22;

  // SIGNATURE SECTION
  if (nextY > 245) {
    doc.addPage();
    nextY = 20;
  }

  const dateNow = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Left: Orang Tua, Right: Wali Kelas, Center: Kepala Sekolah
  const sigY = nextY;
  doc.text("Mengetahui,", leftX + 10, sigY);
  doc.text("Orang Tua / Wali Siswa", leftX + 5, sigY + 4);
  doc.text("............................................", leftX + 5, sigY + 22);

  doc.text(`Jakarta, ${dateNow}`, pageWidth - 70, sigY);
  doc.text("Wali Kelas,", pageWidth - 70, sigY + 4);
  doc.setFont("helvetica", "bold");
  doc.text(data.waliKelasNama || "Capt. Hendra Gunawan, S.T.", pageWidth - 70, sigY + 22);
  doc.setFont("helvetica", "normal");
  doc.text("NIP: 198204122008011005", pageWidth - 70, sigY + 26);

  // Center bottom: Kepala Sekolah
  doc.text("Mengetahui,", pageWidth / 2, sigY + 20, { align: "center" });
  doc.text("Kepala SMK Penerbangan Dirghantara", pageWidth / 2, sigY + 24, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(data.kepsekNama || "Drs. H. Bambang Dirghantara, M.T.", pageWidth / 2, sigY + 42, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("NIP: 196803151992031004", pageWidth / 2, sigY + 46, { align: "center" });

  // Footer stamp
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Dokumen E-Rapor Digital resmi SIMESA SMK Penerbangan Dirghantara dicetak otomatis pada ${new Date().toISOString()}`,
    pageWidth / 2,
    290,
    { align: "center" }
  );

  return doc;
}
