import jsPDF from "jspdf";

export interface PiagamData {
  nama: string;
  nis: string;
  kelas: string;
  programKeahlian?: string;
  rank: number;
  skor: number;
  periode?: string;
  tahunAjaran?: string;
}

export function generatePiagamPdf(data: PiagamData) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm

  // --- BORDER ORNAMEN EMAS & NAVY ---
  // Outer frame
  doc.setDrawColor(24, 43, 73); // Navy
  doc.setLineWidth(1.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Inner gold frame
  doc.setDrawColor(217, 119, 6); // Amber Gold
  doc.setLineWidth(0.8);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

  // Decorative corner accents
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.4);
  doc.rect(16, 16, pageWidth - 32, pageHeight - 32);

  // --- KOP LEMBAGA ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(24, 43, 73);
  doc.text(
    "YAYASAN PENERBANGAN DIRGHANTARA NUSANTARA",
    pageWidth / 2,
    28,
    { align: "center" }
  );

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(
    "SMK PENERBANGAN DIRGHANTARA JAKARTA",
    pageWidth / 2,
    36,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Akreditasi 'A' Unggul | Komplek Bandara Halim Perdanakusuma, Jl. Protokol No. 45 Jakarta Timur",
    pageWidth / 2,
    42,
    { align: "center" }
  );

  // Divider
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.line(40, 46, pageWidth - 40, 46);

  // --- TITLE PIAGAM ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(217, 119, 6); // Gold Amber
  doc.text("PIAGAM PENGHARGAAN", pageWidth / 2, 60, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Nomor: 421.3/DIRG-SMART/AWD/${new Date().getFullYear()}/${data.rank.toString().padStart(3, "0")}`,
    pageWidth / 2,
    67,
    { align: "center" }
  );

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text("Diberikan sebagai bentuk apresiasi kehormatan tertinggi kepada:", pageWidth / 2, 80, {
    align: "center",
  });

  // STUDENT NAME (Highlighted)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(data.nama.toUpperCase(), pageWidth / 2, 94, { align: "center" });

  // Student Identity
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105);
  const prog = data.programKeahlian || (data.kelas.includes("AP") ? "Airframe Powerplant" : "Electrical Avionics");
  doc.text(
    `NIS: ${data.nis}  •  Kelas: ${data.kelas} (${prog})`,
    pageWidth / 2,
    101,
    { align: "center" }
  );

  // Description / Reason
  const rankLabel =
    data.rank === 1
      ? "JUARA I (PERTAMA)"
      : data.rank === 2
      ? "JUARA II (KEDUA)"
      : data.rank === 3
      ? "JUARA III (KETIGA)"
      : `PERINGKAT KE-${data.rank}`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("Atas capaian prestasi terbaik dan dedikasi luar biasa sebagai:", pageWidth / 2, 114, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text(
    `${rankLabel} SISWA TELADAN DIRGHANTARA (SISTEM SPK SMART)`,
    pageWidth / 2,
    124,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Dengan Skor Akhir SMART: ${data.skor} / 100 • Evaluasi Komprehensif Presensi Hanggar, Nilai Kejuruan, dan Karakter Kedisiplinan`,
    pageWidth / 2,
    132,
    { align: "center" }
  );
  doc.text(
    `Tahun Pelajaran ${data.tahunAjaran || "2025/2026"} Semester ${data.periode || "Genap"}`,
    pageWidth / 2,
    138,
    { align: "center" }
  );

  // Signatures
  const dateStr = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);

  // Left Signature: Waka Kesiswaan / Tim SPK
  doc.text(`Jakarta, ${dateStr}`, 45, 155);
  doc.text("Waka Kesiswaan / Tim Penilai SPK,", 45, 160);
  doc.setFont("helvetica", "bold");
  doc.text("Capt. Hendra Gunawan, S.T.", 45, 182);
  doc.setFont("helvetica", "normal");
  doc.text("NIP: 198204122008011005", 45, 186);

  // Right Signature: Kepala Sekolah
  doc.text("Kepala SMK Penerbangan Dirghantara,", pageWidth - 95, 160);
  doc.setFont("helvetica", "bold");
  doc.text("Drs. H. Bambang Dirghantara, M.T.", pageWidth - 95, 182);
  doc.setFont("helvetica", "normal");
  doc.text("NIP: 196803151992031004", pageWidth - 95, 186);

  // Gold Seal / Emblem text center
  doc.setDrawColor(217, 119, 6);
  doc.setFillColor(254, 243, 199);
  doc.circle(pageWidth / 2, 170, 14, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text("SIMESA", pageWidth / 2, 168, { align: "center" });
  doc.text("DIRGHANTARA", pageWidth / 2, 173, { align: "center" });

  return doc;
}
