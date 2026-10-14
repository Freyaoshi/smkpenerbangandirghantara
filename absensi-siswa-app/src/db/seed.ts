/**
 * Seed script — Populates database for SIMESA (SMK Penerbangan Dirghantara)
 * Covering all 12 roles, SPK criteria C1-C5, vocational classes, aviation sarpras,
 * digital library, announcements, and mock attendance/grades/violations.
 *
 * Run: npx tsx src/db/seed.ts
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username, admin } from "better-auth/plugins";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:sqlite.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client, { schema: { ...schema, ...authSchema } });

const auth = betterAuth({
  baseURL: "http://localhost:3000",
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true, minPasswordLength: 4 },
  plugins: [username(), admin({ defaultRole: "user" })],
  user: {
    additionalFields: {
      appRole: {
        type: "string",
        required: false,
        defaultValue: "SISWA",
        input: true,
      },
    },
  },
});

async function seed() {
  console.log("✈️ Seeding SIMESA SMK Penerbangan Dirghantara Database...\n");

  // Helper to create or get user
  async function createAccount(data: {
    email: string;
    username: string;
    name: string;
    password: string;
    appRole: string;
    adminRole?: string;
  }) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: data.email,
          password: data.password,
          name: data.name,
          username: data.username,
          appRole: data.appRole,
        },
      });
      if (data.adminRole) {
        await client.execute({
          sql: "UPDATE user SET role = ? WHERE id = ?",
          args: [data.adminRole, res.user.id],
        });
      }
      console.log(`   ✅ Akun [${data.appRole}]: ${data.username} / ${data.password} (${data.name})`);
      return res.user.id;
    } catch {
      // Check existing user id
      const existing = await client.execute({
        sql: "SELECT id FROM user WHERE username = ? OR email = ?",
        args: [data.username, data.email],
      });
      const id = (existing.rows[0]?.id as string) || "";
      // Ensure appRole is updated
      if (id) {
        await client.execute({
          sql: "UPDATE user SET app_role = ? WHERE id = ?",
          args: [data.appRole, id],
        });
      }
      console.log(`   ⏭️ Akun [${data.appRole}] ${data.username} sudah ada, updated role.`);
      return id;
    }
  }

  // ==========================================
  // 1. Akun 12 Peran Fungsional
  // ==========================================
  console.log("👥 1. Membuat Akun Pengguna 12 Peran Fungsional...");

  // 1. Super Admin
  const superAdminId = await createAccount({
    email: "superadmin@dirghantara.sch.id",
    username: "superadmin01",
    name: "Dr. Ir. Hendra S., M.T. (Super Admin)",
    password: "superadmin123",
    appRole: "SUPER_ADMIN",
    adminRole: "admin",
  });

  // 2. Administrator / Staf TU
  const adminId = await createAccount({
    email: "admin@dirghantara.sch.id",
    username: "admin001",
    name: "Staf Tata Usaha",
    password: "admin123",
    appRole: "ADMIN",
    adminRole: "admin",
  });

  // 3. Kepala Sekolah
  await createAccount({
    email: "kepsek@dirghantara.sch.id",
    username: "kepsek01",
    name: "Marsma TNI (Purn) Sudirman, M.Pd.",
    password: "kepsek123",
    appRole: "KEPALA_SEKOLAH",
  });

  // 4. Petugas Piket
  await createAccount({
    email: "piket@dirghantara.sch.id",
    username: "piket01",
    name: "Serka Agus Suryanto (Piket)",
    password: "piket123",
    appRole: "PETUGAS_PIKET",
  });

  // 5. Dewan Guru (Mapel Airframe & Powerplant)
  const guru1Id = await createAccount({
    email: "budi.santoso@dirghantara.sch.id",
    username: "197601012005",
    name: "Budi Santoso, S.Pd., M.T.",
    password: "guru1234",
    appRole: "GURU",
  });

  // 6. Wali Kelas (Wali Kelas X-AP-1)
  const waliId = await createAccount({
    email: "siti.rahayu@dirghantara.sch.id",
    username: "walikelas01",
    name: "Siti Rahayu, M.Pd.",
    password: "wali123",
    appRole: "WALI_KELAS",
  });

  // 7. Guru BK / Tim Kesiswaan
  await createAccount({
    email: "gurubk@dirghantara.sch.id",
    username: "gurubk01",
    name: "Dra. Retno Wulandari, M.Psi. (BK)",
    password: "bk123",
    appRole: "GURU_BK",
  });

  // 8. Pembina Ekstrakurikuler
  await createAccount({
    email: "ekskul@dirghantara.sch.id",
    username: "pembina01",
    name: "Kapten Tek. Bayu Pratama (Aero Modeling)",
    password: "ekskul123",
    appRole: "PEMBINA_EKSKUL",
  });

  // 9. Pustakawan
  await createAccount({
    email: "perpustakaan@dirghantara.sch.id",
    username: "pustaka01",
    name: "Endang Sulistyo, S.Ptk.",
    password: "pustaka123",
    appRole: "PUSTAKAWAN",
  });

  // 10. Pengelola Sarpras
  await createAccount({
    email: "sarpras@dirghantara.sch.id",
    username: "sarpras01",
    name: "Mayor Tek. Joko Prabowo (Sarpras Hanggar)",
    password: "sarpras123",
    appRole: "SARPRAS",
  });

  // Profil Guru di tabel teachers
  const teachersList = [
    {
      userId: guru1Id,
      nip: "197601012005",
      namaLengkap: "Budi Santoso, S.Pd., M.T.",
      nuptk: "1234567890123451",
      noHp: "08123456781",
      jabatan: "Guru Produktif Airframe Powerplant",
    },
    {
      userId: waliId,
      nip: "198203152008",
      namaLengkap: "Siti Rahayu, M.Pd.",
      nuptk: "1234567890123452",
      noHp: "08123456782",
      jabatan: "Wali Kelas X-AP-1 & Guru Matematika",
    },
  ];

  for (const t of teachersList) {
    try {
      await db.insert(schema.teachers).values({
        userId: t.userId,
        nip: t.nip,
        namaLengkap: t.namaLengkap,
        nuptk: t.nuptk,
        noHp: t.noHp,
        jabatan: t.jabatan,
        status: "aktif",
      });
    } catch {
      // already exists
    }
  }

  // ==========================================
  // 2. Data Kelas & Jurusan Kejuruan Kedirgantaraan
  // ==========================================
  console.log("\n🏫 2. Membuat Data Kelas Kejuruan Dirghantara...");
  const kelasList = [
    { namaKelas: "X-AP-1", tingkat: "X", waliKelas: "Siti Rahayu, M.Pd.", jurusan: "AP" },
    { namaKelas: "X-EA-1", tingkat: "X", waliKelas: "Ahmad Fauzi, S.Pd.", jurusan: "EA" },
    { namaKelas: "XI-AP-1", tingkat: "XI", waliKelas: "Budi Santoso, S.Pd., M.T.", jurusan: "AP" },
    { namaKelas: "XI-EA-1", tingkat: "XI", waliKelas: "Hendra Wijaya, S.T.", jurusan: "EA" },
  ];

  for (const k of kelasList) {
    try {
      await db.insert(schema.classes).values(k);
      console.log(`   ✅ Kelas: ${k.namaKelas} (${k.jurusan}) — Wali: ${k.waliKelas}`);
    } catch {
      // exists
    }
  }

  // ==========================================
  // 3. Data Mata Pelajaran Kejuruan & Umum
  // ==========================================
  console.log("\n📚 3. Membuat Mata Pelajaran Kejuruan & Umum...");
  const mapelList = [
    { namaMapel: "Aircraft Aerodynamics & Flight Mechanics", kelasDiampu: "X-AP-1, XI-AP-1" },
    { namaMapel: "Piston & Gas Turbine Engine Systems", kelasDiampu: "X-AP-1, XI-AP-1" },
    { namaMapel: "Aircraft Electrical & Instrument Systems", kelasDiampu: "X-EA-1, XI-EA-1" },
    { namaMapel: "Avionics Communication & Navigation", kelasDiampu: "X-EA-1, XI-EA-1" },
    { namaMapel: "Matematika Terapan Aviasi", kelasDiampu: "X-AP-1, X-EA-1, XI-AP-1" },
    { namaMapel: "Bahasa Inggris Penerbangan (Aviation English)", kelasDiampu: "X-AP-1, X-EA-1" },
  ];

  for (const m of mapelList) {
    try {
      await db.insert(schema.subjects).values({
        namaMapel: m.namaMapel,
        kelasDiampu: m.kelasDiampu,
      });
      console.log(`   ✅ Mapel: ${m.namaMapel}`);
    } catch {
      // exists
    }
  }

  // ==========================================
  // 4. Data Siswa & Akun Orang Tua (1 Akun Terpadu)
  // ==========================================
  console.log("\n🎓 4. Membuat Data Siswa (Akun Terpadu Siswa & Orang Tua)...");
  const siswaData = [
    { nis: "2024001", nama: "Andi Prasetyo", kelas: "X-AP-1", jk: "L" as const, jur: "Airframe Powerplant", wa: "081234567890", eks: "Aero Modeling" },
    { nis: "2024002", nama: "Dewi Lestari", kelas: "X-AP-1", jk: "P" as const, jur: "Airframe Powerplant", wa: "081234567891", eks: "English Aviation Club" },
    { nis: "2024003", nama: "Rizki Ramadhan", kelas: "X-AP-1", jk: "L" as const, jur: "Airframe Powerplant", wa: "081234567892", eks: "Pramuka Saka Dirgantara" },
    { nis: "2024004", nama: "Siti Nurhaliza", kelas: "X-AP-1", jk: "P" as const, jur: "Airframe Powerplant", wa: "081234567893", eks: "PMR & P3K Udara" },
    { nis: "2024005", nama: "Fajar Nugroho", kelas: "X-AP-1", jk: "L" as const, jur: "Airframe Powerplant", wa: "081234567894", eks: "Aero Modeling" },
    { nis: "2024006", nama: "Muhammad Ilham", kelas: "X-EA-1", jk: "L" as const, jur: "Electrical Avionics", wa: "081234567895", eks: "Robotika Aviasi" },
    { nis: "2024007", nama: "Putri Ayu Wulandari", kelas: "X-EA-1", jk: "P" as const, jur: "Electrical Avionics", wa: "081234567896", eks: "Pramuka Saka Dirgantara" },
    { nis: "2024008", nama: "Bima Sakti", kelas: "X-EA-1", jk: "L" as const, jur: "Electrical Avionics", wa: "081234567897", eks: "Drone Pilot Academy" },
  ];

  const studentRecordIds: { nis: string; studentId: string }[] = [];

  for (const s of siswaData) {
    const userId = await createAccount({
      email: `${s.nis}@siswa.dirghantara.sch.id`,
      username: s.nis,
      name: s.nama,
      password: s.nis, // NIS = default password
      appRole: "SISWA",
    });

    try {
      const res = await db.insert(schema.students).values({
        userId,
        nis: s.nis,
        namaLengkap: s.nama,
        kelas: s.kelas,
        angkatan: "2024",
        jenisKelamin: s.jk,
        programKeahlian: s.jur,
        noWaOrtu: s.wa,
        alamat: "Jl. Dirghantara Raya No. 12, Bandung",
        ekskul: s.eks,
        status: "aktif",
      }).returning();
      if (res[0]) {
        studentRecordIds.push({ nis: s.nis, studentId: res[0].id });
      }
    } catch {
      const existing = await client.execute({
        sql: "SELECT id FROM students WHERE nis = ?",
        args: [s.nis],
      });
      if (existing.rows[0]?.id) {
        studentRecordIds.push({ nis: s.nis, studentId: existing.rows[0].id as string });
      }
    }
  }

  // ==========================================
  // 5. SPK Criteria Standar SMART Sesuai PRD
  // ==========================================
  console.log("\n⚖️ 5. Menyiapkan Kriteria Baku SPK SMART (C1 - C5)...");
  // Bersihkan kriteria lama untuk memastikan bobot & nama sesuai PRD
  await client.execute({ sql: "DELETE FROM spk_criteria" });

  const criteriaSMART = [
    {
      namaKriteria: "C1 — Kehadiran / Presensi",
      bobot: 30,
      tipe: "Otomatis" as const,
      deskripsi: "Persentase kehadiran siswa (otomatis dari data presensi harian Modul B). Bobot 30%.",
    },
    {
      namaKriteria: "C2 — Nilai Rapor / Akademik",
      bobot: 25,
      tipe: "Otomatis" as const,
      deskripsi: "Rata-rata capaian nilai akademik dan praktikum bengkel (Modul D). Bobot 25%.",
    },
    {
      namaKriteria: "C3 — Kedisiplinan / Poin BK",
      bobot: 20,
      tipe: "Otomatis" as const,
      deskripsi: "Skor kedisiplinan berbasis buku saku (100 dikurangi poin pelanggaran BK). Bobot 20%.",
    },
    {
      namaKriteria: "C4 — Keaktifan Ekstrakurikuler",
      bobot: 15,
      tipe: "Manual" as const,
      deskripsi: "Penilaian keikutsertaan dan keaktifan kegiatan ekskul kedirgantaraan. Bobot 15%.",
    },
    {
      namaKriteria: "C5 — Prestasi & Perlombaan",
      bobot: 10,
      tipe: "Manual" as const,
      deskripsi: "Pencapaian medali, kejuaraan LKS, lomba aero modeling/drone. Bobot 10%.",
    },
  ];

  for (const c of criteriaSMART) {
    await db.insert(schema.spkCriteria).values(c);
    console.log(`   ✅ Kriteria: ${c.namaKriteria} [${c.bobot}% - ${c.tipe}]`);
  }

  // ==========================================
  // 6. Tahun Ajaran & Pengaturan Sistem
  // ==========================================
  console.log("\n⚙️ 6. Pengaturan Sistem & Tahun Ajaran...");
  await client.execute({ sql: "DELETE FROM academic_years" });
  await db.insert(schema.academicYears).values({
    tahunAjaran: "2025/2026",
    semester: "Genap",
    isActive: true,
  });

  await client.execute({ sql: "DELETE FROM system_settings" });
  await db.insert(schema.systemSettings).values({
    id: "main",
    schoolName: "SMK Penerbangan Dirghantara",
    schoolAddress: "Jl. Megantara No. 1, Komplek Bandara Husein Sastranegara",
    activeAcademicYear: "2025/2026",
    activeSemester: "Genap",
    waGatewayEnabled: true,
    waGatewayEndpoint: "https://api.fonnte.com/send",
    waGatewayToken: "DEMO-DIRGHANTARA-TOKEN-2026",
    waGatewaySender: "081234567890",
    schoolLatitude: -6.9175,
    schoolLongitude: 107.6191,
    geofenceRadiusMeters: 150.0,
    workStartHour: "07:15",
    workEndHour: "15:30",
  });
  console.log("   ✅ Pengaturan Sistem & Lokasi Hanggar Sekolah tersimpan.");

  // ==========================================
  // 7. Modul F: Buku Saku Kedisiplinan & Pelanggaran
  // ==========================================
  console.log("\n📕 7. Sampel Buku Saku Kedisiplinan Siswa...");
  if (studentRecordIds.length > 2) {
    const s1 = studentRecordIds[2]; // Rizki
    const s2 = studentRecordIds[4]; // Fajar
    try {
      await db.insert(schema.disciplineViolations).values([
        {
          studentId: s1.studentId,
          tanggal: "2026-10-02",
          namaPelanggaran: "Terlambat Apel Kedirgantaraan Pagi",
          kategori: "Ringan",
          poin: 5,
          tindakan: "Teguran lisan & lari keliling hanggar 2 putaran",
          sanksi: "Pembinaan fisik terukur",
          statusSP: "None",
          reportedBy: "Serka Agus Suryanto (Piket)",
          periode: "2025/2026-Genap",
        },
        {
          studentId: s2.studentId,
          tanggal: "2026-10-05",
          namaPelanggaran: "Tidak Menggunakan Wearpack Keselamatan di Bengkel AP",
          kategori: "Sedang",
          poin: 15,
          tindakan: "Peringatan tertulis dan pembinaan K3 bengkel",
          sanksi: "Tugas resume SOP K3 bengkel aviasi",
          statusSP: "None",
          reportedBy: "Budi Santoso, S.Pd., M.T.",
          periode: "2025/2026-Genap",
        },
      ]);
      console.log("   ✅ 2 Catatan Pelanggaran Disiplin ditambahkan.");
    } catch {
      // exists
    }
  }

  // ==========================================
  // 8. Modul G: Mading & Pengumuman Sekolah
  // ==========================================
  console.log("\n📢 8. Pengumuman Mading Digital Sekolah...");
  await client.execute({ sql: "DELETE FROM school_announcements" });
  await db.insert(schema.schoolAnnouncements).values([
    {
      judul: "Apel Akbar Peringatan Hari Penerbangan & Kedirgantaraan",
      kategori: "Apel Kedirgantaraan",
      konten: "Seluruh siswa-siswi dan dewan guru diwajibkan mengenakan Pakaian Dinas Harian (PDH) lengkap pet dan wing pada hari Senin pukul 06.45 WIB di Hanggar Utama.",
      prioritas: "Penting",
      tanggalMulai: "2026-10-01",
      tanggalSelesai: "2026-10-15",
      isPublished: true,
      authorName: "Humas Dirghantara",
      createdAt: new Date().toISOString(),
    },
    {
      judul: "Prestasi Membanggakan: Juara 1 Lomba Aero Modeling Nasional 2026",
      kategori: "Prestasi Siswa",
      konten: "Selamat kepada Tim Aero Modeling SMK Penerbangan Dirghantara yang meraih medali emas kategori Radio Control Pylon Racing tingkat nasional di Lanud Sulaiman.",
      prioritas: "Normal",
      tanggalMulai: "2026-10-04",
      tanggalSelesai: "2026-10-31",
      isPublished: true,
      authorName: "Kesiswaan & Pembina Ekskul",
      createdAt: new Date().toISOString(),
    },
    {
      judul: "Jadwal Praktikum Uji Engine Turboshaft di Bengkel AP",
      kategori: "Agenda Sekolah",
      konten: "Diberitahukan kepada siswa kelas XI-AP bahwa praktikum borescope inspection dan starting engine turboshaft akan dimulai pekan depan. Pastikan membawa logbook dan ear protection.",
      prioritas: "Normal",
      tanggalMulai: "2026-10-08",
      tanggalSelesai: "2026-10-20",
      isPublished: true,
      authorName: "Kepala Bengkel AP",
      createdAt: new Date().toISOString(),
    },
  ]);
  console.log("   ✅ 3 Berita Mading Digital dipublikasikan.");

  // ==========================================
  // 9. Modul H: Perpustakaan Digital Aviasi
  // ==========================================
  console.log("\n📖 9. Koleksi Buku Perpustakaan Aviasi...");
  await client.execute({ sql: "DELETE FROM library_books" });
  await db.insert(schema.libraryBooks).values([
    {
      kodeBuku: "AV-001",
      judul: "Aircraft Basic Science & Materials Eighth Edition",
      pengarang: "Michael J. Kroes & James R. Nolan",
      penerbit: "McGraw-Hill Aviation",
      tahun: "2022",
      kategori: "Kejuruan AP",
      totalStok: 5,
      stokTersedia: 4,
      lokasiRak: "Rak AP-1",
    },
    {
      kodeBuku: "AV-002",
      judul: "Aircraft Electrical and Electronic Systems",
      pengarang: "Mike Tooley & David Wyatt",
      penerbit: "Routledge Aerospace",
      tahun: "2023",
      kategori: "Kejuruan EA",
      totalStok: 4,
      stokTersedia: 3,
      lokasiRak: "Rak EA-2",
    },
    {
      kodeBuku: "AV-003",
      judul: "Aviation Maintenance Technician Handbook: Powerplant",
      pengarang: "Federal Aviation Administration (FAA)",
      penerbit: "FAA Aviation Supplies",
      tahun: "2021",
      kategori: "Aviasi Umum",
      totalStok: 8,
      stokTersedia: 7,
      lokasiRak: "Rak FAA-01",
    },
  ]);
  console.log("   ✅ 3 Koleksi Buku Aviasi ditambahkan.");

  // ==========================================
  // 10. Modul I: Sarpras Fasilitas Hanggar & Bengkel
  // ==========================================
  console.log("\n🛠️ 10. Sarpras & Fasilitas Praktikum Hanggar...");
  await client.execute({ sql: "DELETE FROM sarpras_facilities" });
  await db.insert(schema.sarprasFacilities).values([
    {
      namaFasilitas: "Hanggar Pesawat Dirghantara",
      kode: "HGR-01",
      kategori: "Hanggar Pesawat",
      kapasitas: 60,
      penanggungJawab: "Mayor Tek. Joko Prabowo",
      sopKeselamatan: "Wajib menggunakan wearpack, safety shoes, kacamata pelindung, dan ear defender saat run-up engine.",
      kondisi: "Siap Pakai",
    },
    {
      namaFasilitas: "Bengkel Airframe & Powerplant (AP)",
      kode: "BKL-AP",
      kategori: "Bengkel Airframe Powerplant",
      kapasitas: 36,
      penanggungJawab: "Budi Santoso, S.Pd., M.T.",
      sopKeselamatan: "Patuhi prosedur Lockout/Tagout, pastikan alat pemadam APAR siap pakai di setiap station sheet metal.",
      kondisi: "Siap Pakai",
    },
    {
      namaFasilitas: "Bengkel Electrical Avionics (EA)",
      kode: "BKL-EA",
      kategori: "Bengkel Electrical Avionics",
      kapasitas: 30,
      penanggungJawab: "Hendra Wijaya, S.T.",
      sopKeselamatan: "Gunakan ESD strap saat menangani modul avionics digital. Hindari kontak cairan pada workbench.",
      kondisi: "Siap Pakai",
    },
  ]);
  console.log("   ✅ 3 Fasilitas Sarpras Hanggar/Bengkel terdaftar.");

  // ==========================================
  // 11. Presensi Siswa & Presensi Guru (Biometrik GPS)
  // ==========================================
  console.log("\n📊 11. Membuat Data Presensi Siswa & Guru...");
  const todayStr = new Date().toISOString().split("T")[0];
  
  // Presensi Guru
  try {
    await db.insert(schema.teacherAttendance).values([
      {
        teacherId: guru1Id,
        tanggal: todayStr,
        jamMasuk: "06:58:20",
        jamPulang: "15:35:10",
        status: "Hadir",
        metode: "Biometrik Wajah",
        latitude: -6.91748,
        longitude: 107.61908,
        jarakMeter: 12.5,
        catatan: "Verifikasi biometrik kamera terkonfirmasi presisi",
        verifiedBy: "Sistem AI Face Recognition",
      },
    ]);
  } catch {
    // skip
  }

  // Presensi Siswa Harian
  for (const s of studentRecordIds) {
    try {
      await db.insert(schema.attendance).values({
        studentId: s.studentId,
        tanggal: todayStr,
        mapel: "Umum",
        status: "Hadir",
        periode: "2025/2026-Genap",
      });
    } catch {
      // skip
    }
  }

  // C4 & C5 Penilaian Ekskul & Prestasi (Modul E)
  for (const s of studentRecordIds) {
    try {
      await db.insert(schema.ekskulScores).values({
        studentId: s.studentId,
        periode: "2025/2026-Genap",
        namaEkskul: "Aero Modeling",
        nilaiKeaktifan: Math.floor(Math.random() * 15) + 80, // 80 - 95
        prestasiNama: s.nis === "2024001" ? "Juara 1 RC Pylon Racing" : "Partisipan Lomba Aviasi",
        nilaiPrestasi: s.nis === "2024001" ? 95 : 78,
        inputtedBy: "Kapten Tek. Bayu Pratama",
      });
    } catch {
      // skip
    }
  }

  // Log Audit Trail Awal (Modul O)
  try {
    await db.insert(schema.auditLogs).values({
      userId: superAdminId,
      userName: "Dr. Ir. Hendra S., M.T.",
      role: "SUPER_ADMIN",
      modul: "Sistem SIMESA",
      action: "INIT",
      detail: "Inisialisasi sistem SIMESA SMK Penerbangan Dirghantara dan 12 peran fungsional",
      createdAt: new Date().toISOString(),
    });
  } catch {
    // skip
  }

  console.log("\n✨ Seeding SIMESA Selesai dengan Sempurna!\n");
  console.log("===============================================================");
  console.log("  KREDENSIAL LOGIN LENGKAP SEMUA 12 PERAN (SIMESA)");
  console.log("===============================================================");
  console.log("1.  Super Admin    : superadmin01 / superadmin123");
  console.log("2.  Staf TU/Admin  : admin001     / admin123");
  console.log("3.  Kepala Sekolah : kepsek01     / kepsek123");
  console.log("4.  Petugas Piket  : piket01      / piket123");
  console.log("5.  Dewan Guru     : 197601012005 / guru1234");
  console.log("6.  Wali Kelas     : walikelas01  / wali123");
  console.log("7.  Guru BK        : gurubk01     / bk123");
  console.log("8.  Pembina Ekskul : pembina01    / ekskul123");
  console.log("9.  Pustakawan     : pustaka01    / pustaka123");
  console.log("10. Sarpras        : sarpras01    / sarpras123");
  console.log("11. Siswa & Ortu   : 2024001      / 2024001 (Andi Prasetyo - X-AP-1)");
  console.log("===============================================================\n");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
