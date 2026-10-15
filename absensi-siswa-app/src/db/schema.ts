import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// ============================================================
// App-specific tables for SIMESA - SMK Penerbangan Dirghantara
// ============================================================

// --- Students (profil siswa, linked to Better Auth user) ---
export const students = sqliteTable("students", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(), // FK to Better Auth 'user' table
  nis: text("nis").notNull().unique(),
  namaLengkap: text("nama_lengkap").notNull(),
  kelas: text("kelas").notNull(),
  angkatan: text("angkatan").notNull(),
  jenisKelamin: text("jenis_kelamin", { enum: ["L", "P"] }).notNull(),
  status: text("status", { enum: ["aktif", "nonaktif"] }).notNull().default("aktif"),
  programKeahlian: text("program_keahlian").default("Airframe Powerplant"), // "Airframe Powerplant (AP)" atau "Electrical Avionics (EA)"
  noWaOrtu: text("no_wa_ortu"), // Nomor WA Orang Tua untuk Bot WA Gateway & Portal Orang Tua
  alamat: text("alamat"),
  ekskul: text("ekskul"),
}, (table) => [
  index("students_user_idx").on(table.userId),
  index("students_kelas_idx").on(table.kelas),
]);

// --- Teachers (profil guru & staf, linked to Better Auth user) ---
export const teachers = sqliteTable("teachers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(), // FK to Better Auth 'user' table
  nip: text("nip").notNull().unique(),
  namaLengkap: text("nama_lengkap").notNull(),
  jenisKelamin: text("jenis_kelamin", { enum: ["L", "P"] }).notNull().default("L"),
  status: text("status", { enum: ["aktif", "nonaktif"] }).notNull().default("aktif"),
  nuptk: text("nuptk"),
  noHp: text("no_hp"),
  jabatan: text("jabatan").default("Guru Kejuruan"), // Guru, Wali Kelas, Kepala Sekolah, Petugas Piket, Guru BK, Pembina Ekskul, Pustakawan, Sarpras
}, (table) => [
  index("teachers_user_idx").on(table.userId),
]);

// --- Kelas (daftar kelas kejuruan) ---
export const classes = sqliteTable("classes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  namaKelas: text("nama_kelas").notNull().unique(),
  tingkat: text("tingkat").notNull(),
  waliKelas: text("wali_kelas"),
  jurusan: text("jurusan").default("AP"), // "AP" (Airframe Powerplant) atau "EA" (Electrical Avionics)
});

// --- Mata Pelajaran ---
export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  namaMapel: text("nama_mapel").notNull(),
  teacherId: text("teacher_id"),
  kelasDiampu: text("kelas_diampu"),
});

// --- Attendance (absensi harian siswa) ---
export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").notNull(),
  tanggal: text("tanggal").notNull(), // ISO date string YYYY-MM-DD
  mapel: text("mapel").default("Umum"), // "Umum" if not mapped to specific subject
  status: text("status", { enum: ["Hadir", "Izin", "Sakit", "Alfa"] }).notNull(),
  recordedBy: text("recorded_by"), // userId of teacher who recorded
  periode: text("periode").notNull().default("2025/2026-Genap"), // Isolation tag
}, (table) => [
  index("att_student_idx").on(table.studentId),
  index("att_tanggal_idx").on(table.tanggal),
  index("att_periode_idx").on(table.periode),
]);

// --- Presensi Guru Biometrik Wajah & Geolokasi (Modul C) ---
export const teacherAttendance = sqliteTable("teacher_attendance", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  teacherId: text("teacher_id").notNull(),
  tanggal: text("tanggal").notNull(), // YYYY-MM-DD
  jamMasuk: text("jam_masuk"), // HH:mm:ss
  jamPulang: text("jam_pulang"),
  status: text("status", { enum: ["Hadir", "Terlambat", "Izin", "Sakit", "Alfa"] }).notNull(),
  metode: text("metode", { enum: ["Biometrik Wajah", "Manual Petugas Piket"] }).notNull().default("Biometrik Wajah"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  jarakMeter: real("jarak_meter"),
  fotoSelfie: text("foto_selfie"), // Data URL / path snapshot
  catatan: text("catatan"),
  verifiedBy: text("verified_by"),
}, (table) => [
  index("teacher_att_date_idx").on(table.tanggal),
  index("teacher_att_teacher_idx").on(table.teacherId),
]);

// --- SPK Criteria (kriteria + bobot metode SMART) ---
export const spkCriteria = sqliteTable("spk_criteria", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  namaKriteria: text("nama_kriteria").notNull().unique(),
  bobot: real("bobot").notNull(), // percentage weight (total 100%)
  tipe: text("tipe", { enum: ["Otomatis", "Manual"] }).notNull(),
  deskripsi: text("deskripsi"),
});

// --- SPK Scores (nilai per kriteria per siswa) ---
export const spkScores = sqliteTable("spk_scores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").notNull(),
  criteriaId: text("criteria_id").notNull(),
  mapel: text("mapel"), // Null if it's general
  nilai: real("nilai").notNull().default(0),
  details: text("details"), // JSON string e.g. '{"Tugas": 80, "UTS": 90, "Praktik": 85}'
  periode: text("periode").notNull(),
}, (table) => [
  index("spk_scores_student_idx").on(table.studentId),
  index("spk_scores_periode_idx").on(table.periode),
]);

// --- Leaderboard Archives (arsip historis) ---
export const leaderboardArchives = sqliteTable("leaderboard_archives", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  namaFile: text("nama_file").notNull(),
  pathFile: text("path_file").notNull(),
  periode: text("periode").notNull(),
  uploadedAt: text("uploaded_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// --- Academic Years (tahun ajaran) ---
export const academicYears = sqliteTable("academic_years", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  tahunAjaran: text("tahun_ajaran").notNull(), // e.g. "2025/2026"
  semester: text("semester", { enum: ["Ganjil", "Genap"] }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
});

// --- SPK Grading Categories (kategori nilai dinamis per mapel/kriteria) ---
export const spkGradingCategories = sqliteTable("spk_grading_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  kelas: text("kelas").notNull(),
  mapel: text("mapel").notNull(),
  criteriaId: text("criteria_id").notNull(),
  periode: text("periode").notNull(),
  categories: text("categories").notNull(), // JSON string array, e.g., '["Tugas", "Ulangan", "Praktik Bengkel"]'
});

// --- SPK Publish Status ---
export const spkPublishStatus = sqliteTable("spk_publish_status", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  periode: text("periode").notNull().unique(),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  publishedAt: text("published_at"),
  publishedBy: text("published_by"),
});

// --- SPK Results (Cached Leaderboard) ---
export const spkResults = sqliteTable("spk_results", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").notNull(),
  periode: text("periode").notNull(),
  kelas: text("kelas").notNull(),
  rank: integer("rank").notNull(),
  rawScore: real("raw_score").notNull(),
  persentase: real("persentase").notNull(),
  details: text("details"),
}, (table) => [
  index("spk_results_student_idx").on(table.studentId),
  index("spk_results_periode_idx").on(table.periode),
]);

// --- Buku Saku Digital Kedisiplinan Siswa (Modul F) ---
export const disciplineViolations = sqliteTable("discipline_violations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").notNull(),
  tanggal: text("tanggal").notNull(), // YYYY-MM-DD
  namaPelanggaran: text("nama_pelanggaran").notNull(),
  kategori: text("kategori", { enum: ["Ringan", "Sedang", "Berat"] }).notNull(),
  poin: integer("poin").notNull(), // e.g. 5, 15, 50
  tindakan: text("tindakan"), // Pembinaan, teguran lisan, skorsing
  sanksi: text("sanksi"),
  statusSP: text("status_sp", { enum: ["None", "SP 1", "SP 2", "SP 3", "Pleno"] }).notNull().default("None"),
  reportedBy: text("reported_by"), // nama guru/petugas BK
  periode: text("periode").notNull().default("2025/2026-Genap"),
}, (table) => [
  index("violations_student_idx").on(table.studentId),
  index("violations_date_idx").on(table.tanggal),
]);

// --- Bimbingan Konseling & Layanan Kesiswaan (Modul L - Rahasia) ---
export const counselingRecords = sqliteTable("counseling_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").notNull(),
  counselorId: text("counselor_id").notNull(),
  tanggal: text("tanggal").notNull(),
  jenisBimbingan: text("jenis_bimbingan", { enum: ["Pribadi", "Sosial", "Belajar", "Karir / Kedirgantaraan"] }).notNull(),
  ringkasanMasalah: text("ringkasan_masalah").notNull(),
  tindakLanjut: text("tindak_lanjut"),
  status: text("status", { enum: ["Dalam Proses", "Selesai"] }).notNull().default("Dalam Proses"),
  catatanRahasia: text("catatan_rahasia"),
}, (table) => [
  index("counseling_student_idx").on(table.studentId),
]);

// --- Mading & Pengumuman Sekolah Digital (Modul G) ---
export const schoolAnnouncements = sqliteTable("school_announcements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  judul: text("judul").notNull(),
  kategori: text("kategori", { enum: ["Agenda Sekolah", "Apel Kedirgantaraan", "Surat Edaran", "Prestasi Siswa", "Umum"] }).notNull(),
  konten: text("konten").notNull(),
  prioritas: text("prioritas", { enum: ["Normal", "Penting", "Urgent"] }).notNull().default("Normal"),
  tanggalMulai: text("tanggal_mulai"),
  tanggalSelesai: text("tanggal_selesai"),
  imageUrl: text("image_url"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  authorName: text("author_name").default("Humas Dirghantara"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

// --- Perpustakaan Digital Sekolah (Modul H) ---
export const libraryBooks = sqliteTable("library_books", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  kodeBuku: text("kode_buku").notNull().unique(),
  judul: text("judul").notNull(),
  pengarang: text("pengarang").notNull(),
  penerbit: text("penerbit"),
  tahun: text("tahun"),
  kategori: text("kategori", { enum: ["Kejuruan AP", "Kejuruan EA", "Aviasi Umum", "Mata Pelajaran Umum"] }).notNull(),
  totalStok: integer("total_stok").notNull().default(1),
  stokTersedia: integer("stok_tersedia").notNull().default(1),
  lokasiRak: text("lokasi_rak").default("Rak A-1"),
});

export const libraryLoans = sqliteTable("library_loans", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  bookId: text("book_id").notNull(),
  studentId: text("student_id").notNull(),
  tanggalPinjam: text("tanggal_pinjam").notNull(),
  tenggatKembali: text("tenggat_kembali").notNull(),
  tanggalKembali: text("tanggal_kembali"),
  status: text("status", { enum: ["Dipinjam", "Kembali", "Terlambat"] }).notNull().default("Dipinjam"),
  petugas: text("petugas"),
}, (table) => [
  index("library_loans_student_idx").on(table.studentId),
]);

// --- Informasi Sarpras & Fasilitas Bengkel/Hanggar (Modul I) ---
export const sarprasFacilities = sqliteTable("sarpras_facilities", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  namaFasilitas: text("nama_fasilitas").notNull(),
  kode: text("kode").notNull().unique(),
  kategori: text("kategori", { enum: ["Hanggar Pesawat", "Bengkel Airframe Powerplant", "Bengkel Electrical Avionics", "Lab Komputer"] }).notNull(),
  kapasitas: integer("kapasitas").default(36),
  penanggungJawab: text("penanggung_jawab"),
  sopKeselamatan: text("sop_keselamatan"),
  kondisi: text("kondisi", { enum: ["Siap Pakai", "Perawatan", "Terbatas"] }).notNull().default("Siap Pakai"),
});

export const sarprasSchedules = sqliteTable("sarpras_schedules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  facilityId: text("facility_id").notNull(),
  kelas: text("kelas").notNull(),
  tanggal: text("tanggal").notNull(),
  jamMulai: text("jam_mulai").notNull(),
  jamSelesai: text("jam_selesai").notNull(),
  guruPengampu: text("guru_pengampu").notNull(),
  keperluan: text("keperluan").notNull(),
  status: text("status", { enum: ["Dijadwalkan", "Berlangsung", "Selesai"] }).notNull().default("Dijadwalkan"),
});

// --- LMS Pembelajaran Daring (Modul J) ---
export const lmsMaterials = sqliteTable("lms_materials", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  mapel: text("mapel").notNull(),
  kelas: text("kelas").notNull(),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi"),
  fileUrl: text("file_url"),
  tipe: text("tipe", { enum: ["Modul PDF", "Bahan Tayang PPT", "Video Praktik", "Referensi Web"] }).notNull().default("Modul PDF"),
  guruId: text("guru_id"),
  guruNama: text("guru_nama"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const lmsAssignments = sqliteTable("lms_assignments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  mapel: text("mapel").notNull(),
  kelas: text("kelas").notNull(),
  judul: text("judul").notNull(),
  deskripsi: text("deskripsi"),
  tenggatWaktu: text("tenggat_waktu").notNull(),
  guruId: text("guru_id"),
  guruNama: text("guru_nama"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const lmsSubmissions = sqliteTable("lms_submissions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  assignmentId: text("assignment_id").notNull(),
  studentId: text("student_id").notNull(),
  catatan: text("catatan"),
  fileUrl: text("file_url"),
  submittedAt: text("submitted_at").notNull().$defaultFn(() => new Date().toISOString()),
  nilai: real("nilai"),
  feedback: text("feedback"),
}, (table) => [
  index("lms_sub_assignment_idx").on(table.assignmentId),
  index("lms_sub_student_idx").on(table.studentId),
]);

// --- Kuesioner Evaluasi Pembelajaran Guru (Modul K) ---
export const teacherEvaluations = sqliteTable("teacher_evaluations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").notNull(),
  teacherId: text("teacher_id").notNull(),
  mapel: text("mapel").notNull(),
  periode: text("periode").notNull().default("2025/2026-Genap"),
  skorPedagogik: integer("skor_pedagogik").notNull(), // Skala 1-5
  skorProfesional: integer("skor_profesional").notNull(),
  skorKepribadian: integer("skor_kepribadian").notNull(),
  skorSosial: integer("skor_sosial").notNull(),
  saran: text("saran"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index("eval_teacher_idx").on(table.teacherId),
]);

// --- Penilaian Ekskul & Prestasi (Modul E: C4 & C5 SPK SMART) ---
export const ekskulScores = sqliteTable("ekskul_scores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  studentId: text("student_id").notNull(),
  periode: text("periode").notNull().default("2025/2026-Genap"),
  namaEkskul: text("nama_ekskul").default("Aero Modeling"),
  nilaiKeaktifan: real("nilai_keaktifan").notNull().default(85), // C4 (15%)
  prestasiNama: text("prestasi_nama"),
  nilaiPrestasi: real("nilai_prestasi").notNull().default(75), // C5 (10%)
  catatan: text("catatan"),
  inputtedBy: text("inputted_by"),
}, (table) => [
  index("ekskul_student_idx").on(table.studentId),
  index("ekskul_periode_idx").on(table.periode),
]);

// --- Pengaturan Sistem & WA Gateway (Super Admin Config) ---
export const systemSettings = sqliteTable("system_settings", {
  id: text("id").primaryKey().$defaultFn(() => "main"),
  schoolName: text("school_name").notNull().default("SMK Penerbangan Dirghantara"),
  schoolAddress: text("school_address").notNull().default("Jl. Megantara No. 1, Komplek Bandara"),
  activeAcademicYear: text("active_academic_year").notNull().default("2025/2026"),
  activeSemester: text("active_semester").notNull().default("Genap"),
  waGatewayEnabled: integer("wa_gateway_enabled", { mode: "boolean" }).notNull().default(false),
  waGatewayEndpoint: text("wa_gateway_endpoint").notNull().default("https://api.fonnte.com/send"),
  waGatewayToken: text("wa_gateway_token").default(""),
  waGatewaySender: text("wa_gateway_sender").default("081234567890"),
  schoolLatitude: real("school_latitude").notNull().default(-6.9175),
  schoolLongitude: real("school_longitude").notNull().default(107.6191),
  geofenceRadiusMeters: real("geofence_radius_meters").notNull().default(150.0),
  workStartHour: text("work_start_hour").notNull().default("07:15"),
  workEndHour: text("work_end_hour").notNull().default("15:30"),
});

// --- Audit Trail / Log Perubahan Data (Modul O) ---
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  role: text("role").notNull(),
  modul: text("modul").notNull(), // Presensi, Nilai, SPK, Akun, Sistem, BK, dll.
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, CALCULATE, PUBLISH, LOGIN
  detail: text("detail").notNull(),
  ipAddress: text("ip_address"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  index("audit_created_idx").on(table.createdAt),
  index("audit_modul_idx").on(table.modul),
]);

// ============================================================
// Type exports
// ============================================================
export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Teacher = typeof teachers.$inferSelect;
export type NewTeacher = typeof teachers.$inferInsert;
export type AttendanceRecord = typeof attendance.$inferSelect;
export type NewAttendanceRecord = typeof attendance.$inferInsert;
export type TeacherAttendanceRecord = typeof teacherAttendance.$inferSelect;
export type SpkCriteriaRow = typeof spkCriteria.$inferSelect;
export type SpkScoreRow = typeof spkScores.$inferSelect;
export type SpkGradingCategoryRow = typeof spkGradingCategories.$inferSelect;
export type SpkPublishStatusRow = typeof spkPublishStatus.$inferSelect;
export type SpkResultRow = typeof spkResults.$inferSelect;
export type DisciplineViolation = typeof disciplineViolations.$inferSelect;
export type CounselingRecord = typeof counselingRecords.$inferSelect;
export type SchoolAnnouncement = typeof schoolAnnouncements.$inferSelect;
export type LibraryBook = typeof libraryBooks.$inferSelect;
export type LibraryLoan = typeof libraryLoans.$inferSelect;
export type SarprasFacility = typeof sarprasFacilities.$inferSelect;
export type SarprasSchedule = typeof sarprasSchedules.$inferSelect;
export type LmsMaterial = typeof lmsMaterials.$inferSelect;
export type LmsAssignment = typeof lmsAssignments.$inferSelect;
export type LmsSubmission = typeof lmsSubmissions.$inferSelect;
export type TeacherEvaluation = typeof teacherEvaluations.$inferSelect;
export type EkskulScore = typeof ekskulScores.$inferSelect;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
