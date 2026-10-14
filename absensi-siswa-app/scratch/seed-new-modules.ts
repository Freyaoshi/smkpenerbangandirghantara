import "dotenv/config";
import { db } from "../src/db/index";
import {
  madingPosts,
  violations,
  teacherAttendance,
  labSchedules,
  assignments,
  submissions,
  eRapor,
  botNotifLogs,
  students,
  teachers
} from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seedNewModules() {
  console.log("🌱 Seeding 6 New Modules Data...");

  const allStudents = await db.select().from(students).all();
  const allTeachers = await db.select().from(teachers).all();

  if (allStudents.length === 0 || allTeachers.length === 0) {
    console.error("❌ Run main seed.ts first!");
    return;
  }

  const s1 = allStudents[0]; // Andi Prasetyo
  const s2 = allStudents[1]; // Dewi Lestari
  const t1 = allTeachers[0]; // Budi Santoso
  const t2 = allTeachers[1]; // Siti Rahayu

  // 1. Mading Posts
  await db.delete(madingPosts).run();
  await db.insert(madingPosts).values([
    {
      id: crypto.randomUUID(),
      judul: "📌 Pengumuman Jadwal Ujian Tengah Semester (UTS) Genap 2025/2026",
      konten: "Diberitahukan kepada seluruh siswa X, XI, dan XII bahwa UTS Genap akan dilaksanakan mulai tanggal 15 Maret 2026. Harap mempersiapkan diri dan melunasi administrasi.",
      kategori: "Pengumuman",
      authorName: "Panitia Ujian",
      isPinned: true,
      tanggal: "2026-03-01",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: crypto.randomUUID(),
      judul: "🏆 Selamat! Tim Robotik Sekolah Memenangkan Juara 1 Tingkat Nasional",
      konten: "Selamat kepada tim robotik sekolah yang berhasil meraih Medali Emas dalam National Robotics Championship 2026. Bangga melayani prestasi terbaik anak bangsa!",
      kategori: "Prestasi",
      authorName: "Humas Sekolah",
      isPinned: false,
      tanggal: "2026-03-03",
      imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60"
    },
    {
      id: crypto.randomUUID(),
      judul: "⚽ Pendaftaran Ekstrakurikuler Futsal & Basket Semester Genap Buka Kembali",
      konten: "Bagi siswa yang ingin bergabung dalam tim futsal dan basket sekolah, pendaftaran dibuka sampai hari Jumat ini. Hubungi Pembina Ekskul Pak Budi.",
      kategori: "Ekstrakurikuler",
      authorName: "Pembina Ekskul",
      isPinned: false,
      tanggal: "2026-03-04"
    }
  ]).run();

  // 2. Violations (Sanksi & Poin Pelanggaran)
  await db.delete(violations).run();
  await db.insert(violations).values([
    {
      id: crypto.randomUUID(),
      studentId: s1.id,
      jenisPelanggaran: "Terlambat Masuk Sekolah (>15 Menit)",
      poinMinus: 5,
      kategori: "Kedisiplinan",
      tanggal: "2026-02-18",
      catatan: "Terlambat karena kendala hujan deras.",
      reportedBy: "Guru Piket"
    },
    {
      id: crypto.randomUUID(),
      studentId: s2.id,
      jenisPelanggaran: "Tidak Memakai Seragam Lengkap (Atribut atribut)",
      poinMinus: 3,
      kategori: "Kedisiplinan",
      tanggal: "2026-02-22",
      catatan: "Lupa memakai dasi pada upacara.",
      reportedBy: "Tim Kesiswaan"
    }
  ]).run();

  // 3. Teacher Attendance (Absensi Wajah Guru)
  try {
    await db.delete(teacherAttendance).run();
  } catch (e) {
    console.log("Teacher attendance skip delete");
  }

  // 4. Lab Schedules (Portal Laboratorium)
  await db.delete(labSchedules).run();
  await db.insert(labSchedules).values([
    {
      id: crypto.randomUUID(),
      namaLab: "Lab Komputer 1 (Sains Data)",
      mapel: "Pemrograman Web & SPK",
      guruId: t1.id,
      namaGuru: t1.namaLengkap,
      tanggal: "2026-03-06",
      jamMulai: "08:00",
      jamSelesai: "10:00",
      topikPraktikum: "Praktikum Algoritma SPK TOPSIS & Drizzle ORM",
      status: "Disetujui"
    },
    {
      id: crypto.randomUUID(),
      namaLab: "Lab Fisika & IPA Terpadu",
      mapel: "Fisika Terapan",
      guruId: t1.id,
      namaGuru: t1.namaLengkap,
      tanggal: "2026-03-07",
      jamMulai: "10:30",
      jamSelesai: "12:00",
      topikPraktikum: "Uji Coba Pengukuran Gelombang Elektromagnetik",
      status: "Disetujui"
    },
    {
      id: crypto.randomUUID(),
      namaLab: "Lab Bahasa Digital",
      mapel: "Bahasa Inggris Komunikasi",
      guruId: t2.id,
      namaGuru: t2.namaLengkap,
      tanggal: "2026-03-08",
      jamMulai: "13:00",
      jamSelesai: "14:30",
      topikPraktikum: "Listening & Conversation Test Lab",
      status: "Pending"
    }
  ]).run();

  // 5. LMS Assignments & Submissions
  await db.delete(assignments).run();
  await db.delete(submissions).run();
  const assignId = crypto.randomUUID();
  await db.insert(assignments).values([
    {
      id: assignId,
      judul: "Tugas 1: Analisis Model SPK SAW vs TOPSIS dalam Kasus Rapor",
      deskripsi: "Kerjakan laporan studi kasus perbandingan metode SAW dan TOPSIS dalam penentuan siswa berprestasi. Format PDF max 5MB.",
      mapel: "Matematika",
      kelas: "X-A",
      teacherId: t1.id,
      deadline: "2026-03-10 23:59",
      createdAt: "2026-03-01 08:00"
    }
  ]).run();

  await db.insert(submissions).values([
    {
      id: crypto.randomUUID(),
      assignmentId: assignId,
      studentId: s1.id,
      fileUrl: "/docs/tugas_spk_andi.pdf",
      jawabanText: "Tugas SPK telah selesai dikerjakan dengan analisis lengkap perhitungan matriks ternormalisasi.",
      nilai: 92,
      catatanGuru: "Analisis sangat tajam dan tepat. Bagus sekali!",
      submittedAt: "2026-03-03 14:20"
    },
    {
      id: crypto.randomUUID(),
      assignmentId: assignId,
      studentId: s2.id,
      fileUrl: "/docs/tugas_spk_dewi.pdf",
      jawabanText: "Berikut laporan komprehensif perbandingan TOPSIS dan SAW.",
      nilai: 88,
      catatanGuru: "Perhitungan matriks sangat rapi dan sistematis.",
      submittedAt: "2026-03-04 10:15"
    }
  ]).run();

  // 6. E-Rapor Digital
  await db.delete(eRapor).run();
  await db.insert(eRapor).values([
    {
      id: crypto.randomUUID(),
      studentId: s1.id,
      periode: "2025/2026-Genap",
      catatanWali: "Siswa menunjukkan kedisiplinan dan prestasi belajar yang sangat baik di semester ini. Pertahankan!",
      statusReview: "Normal"
    },
    {
      id: crypto.randomUUID(),
      studentId: s2.id,
      periode: "2025/2026-Genap",
      catatanWali: "Aktif dalam pembelajaran, perlu peningkatan konsistensi pada latihan mandiri.",
      statusReview: "Diajukan",
      pesanReview: "Mohon peninjauan ulang pada kriteria nilai keaktifan Bahasa Inggris, karena terjadi salah cetak nilai tugas 2."
    }
  ]).run();

  // 7. Bot Notif Logs
  await db.delete(botNotifLogs).run();
  await db.insert(botNotifLogs).values([
    {
      id: crypto.randomUUID(),
      studentId: s2.id,
      namaSiswa: s2.namaLengkap,
      namaOrtu: "Bpk. Bambang Lestari",
      noHpOrtu: "+6281234567890",
      pesan: "[SISTEM ABSENSI OTOMATIS 5 JAM] Diberitahukan bahwa ananda Dewi Lestari belum mencatatkan presensi kelas pada hari ini hingga pukul 12.00 WIB (Alfa > 5 jam). Hubungi Wali Kelas jika izin/sakit.",
      statusKirim: "Sent",
      sentAt: "2026-03-05 12:05:10"
    }
  ]).run();

  console.log("✨ All 6 new modules successfully seeded!");
}

seedNewModules().catch(console.error);
