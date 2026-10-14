import Database from "better-sqlite3";

const db = new Database("sqlite.db");

console.log("🛠️ Migrating SQLite database for SIMESA SMK Penerbangan Dirghantara...");

// Helper for column adding
function addColumnIfNotExists(table: string, column: string, typeDef: string) {
  try {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    const exists = columns.some((c) => c.name === column);
    if (!exists) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeDef}`).run();
      console.log(`   + Added column ${table}.${column}`);
    }
  } catch (err) {
    console.warn(`   ⚠️ Warning adding ${table}.${column}:`, err);
  }
}

// 1. Alter existing tables if needed
addColumnIfNotExists("students", "program_keahlian", "TEXT DEFAULT 'Airframe Powerplant'");
addColumnIfNotExists("students", "no_wa_ortu", "TEXT");
addColumnIfNotExists("students", "alamat", "TEXT");
addColumnIfNotExists("students", "ekskul", "TEXT");

addColumnIfNotExists("teachers", "nuptk", "TEXT");
addColumnIfNotExists("teachers", "no_hp", "TEXT");
addColumnIfNotExists("teachers", "jabatan", "TEXT DEFAULT 'Guru Kejuruan'");

addColumnIfNotExists("classes", "jurusan", "TEXT DEFAULT 'AP'");

// 2. Create new tables
db.exec(`
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  jam_masuk TEXT,
  jam_pulang TEXT,
  status TEXT NOT NULL,
  metode TEXT NOT NULL DEFAULT 'Biometrik Wajah',
  latitude REAL,
  longitude REAL,
  jarak_meter REAL,
  foto_selfie TEXT,
  catatan TEXT,
  verified_by TEXT
);
CREATE INDEX IF NOT EXISTS teacher_att_date_idx ON teacher_attendance (tanggal);
CREATE INDEX IF NOT EXISTS teacher_att_teacher_idx ON teacher_attendance (teacher_id);

CREATE TABLE IF NOT EXISTS discipline_violations (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  nama_pelanggaran TEXT NOT NULL,
  kategori TEXT NOT NULL,
  poin INTEGER NOT NULL,
  tindakan TEXT,
  sanksi TEXT,
  status_sp TEXT NOT NULL DEFAULT 'None',
  reported_by TEXT,
  periode TEXT NOT NULL DEFAULT '2025/2026-Genap'
);
CREATE INDEX IF NOT EXISTS violations_student_idx ON discipline_violations (student_id);
CREATE INDEX IF NOT EXISTS violations_date_idx ON discipline_violations (tanggal);

CREATE TABLE IF NOT EXISTS counseling_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  counselor_id TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  jenis_bimbingan TEXT NOT NULL,
  ringkasan_masalah TEXT NOT NULL,
  tindak_lanjut TEXT,
  status TEXT NOT NULL DEFAULT 'Dalam Proses',
  catatan_rahasia TEXT
);
CREATE INDEX IF NOT EXISTS counseling_student_idx ON counseling_records (student_id);

CREATE TABLE IF NOT EXISTS school_announcements (
  id TEXT PRIMARY KEY,
  judul TEXT NOT NULL,
  kategori TEXT NOT NULL,
  konten TEXT NOT NULL,
  prioritas TEXT NOT NULL DEFAULT 'Normal',
  tanggal_mulai TEXT,
  tanggal_selesai TEXT,
  is_published INTEGER NOT NULL DEFAULT 1,
  author_name TEXT DEFAULT 'Humas Dirghantara',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS library_books (
  id TEXT PRIMARY KEY,
  kode_buku TEXT NOT NULL UNIQUE,
  judul TEXT NOT NULL,
  pengarang TEXT NOT NULL,
  penerbit TEXT,
  tahun TEXT,
  kategori TEXT NOT NULL,
  total_stok INTEGER NOT NULL DEFAULT 1,
  stok_tersedia INTEGER NOT NULL DEFAULT 1,
  lokasi_rak TEXT DEFAULT 'Rak A-1'
);

CREATE TABLE IF NOT EXISTS library_loans (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  tanggal_pinjam TEXT NOT NULL,
  tenggat_kembali TEXT NOT NULL,
  tanggal_kembali TEXT,
  status TEXT NOT NULL DEFAULT 'Dipinjam',
  petugas TEXT
);
CREATE INDEX IF NOT EXISTS library_loans_student_idx ON library_loans (student_id);

CREATE TABLE IF NOT EXISTS sarpras_facilities (
  id TEXT PRIMARY KEY,
  nama_fasilitas TEXT NOT NULL,
  kode TEXT NOT NULL UNIQUE,
  kategori TEXT NOT NULL,
  kapasitas INTEGER DEFAULT 36,
  penanggung_jawab TEXT,
  sop_keselamatan TEXT,
  kondisi TEXT NOT NULL DEFAULT 'Siap Pakai'
);

CREATE TABLE IF NOT EXISTS sarpras_schedules (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL,
  kelas TEXT NOT NULL,
  tanggal TEXT NOT NULL,
  jam_mulai TEXT NOT NULL,
  jam_selesai TEXT NOT NULL,
  guru_pengampu TEXT NOT NULL,
  keperluan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Dijadwalkan'
);

CREATE TABLE IF NOT EXISTS lms_materials (
  id TEXT PRIMARY KEY,
  mapel TEXT NOT NULL,
  kelas TEXT NOT NULL,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  file_url TEXT,
  tipe TEXT NOT NULL DEFAULT 'Modul PDF',
  guru_id TEXT,
  guru_nama TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lms_assignments (
  id TEXT PRIMARY KEY,
  mapel TEXT NOT NULL,
  kelas TEXT NOT NULL,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  tenggat_waktu TEXT NOT NULL,
  guru_id TEXT,
  guru_nama TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lms_submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  catatan TEXT,
  file_url TEXT,
  submitted_at TEXT NOT NULL,
  nilai REAL,
  feedback TEXT
);
CREATE INDEX IF NOT EXISTS lms_sub_assignment_idx ON lms_submissions (assignment_id);
CREATE INDEX IF NOT EXISTS lms_sub_student_idx ON lms_submissions (student_id);

CREATE TABLE IF NOT EXISTS teacher_evaluations (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  mapel TEXT NOT NULL,
  periode TEXT NOT NULL DEFAULT '2025/2026-Genap',
  skor_pedagogik INTEGER NOT NULL,
  skor_profesional INTEGER NOT NULL,
  skor_kepribadian INTEGER NOT NULL,
  skor_sosial INTEGER NOT NULL,
  saran TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS eval_teacher_idx ON teacher_evaluations (teacher_id);

CREATE TABLE IF NOT EXISTS ekskul_scores (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  periode TEXT NOT NULL DEFAULT '2025/2026-Genap',
  nama_ekskul TEXT DEFAULT 'Aero Modeling',
  nilai_keaktifan REAL NOT NULL DEFAULT 85,
  prestasi_nama TEXT,
  nilai_prestasi REAL NOT NULL DEFAULT 75,
  catatan TEXT,
  inputted_by TEXT
);
CREATE INDEX IF NOT EXISTS ekskul_student_idx ON ekskul_scores (student_id);
CREATE INDEX IF NOT EXISTS ekskul_periode_idx ON ekskul_scores (periode);

CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY,
  school_name TEXT NOT NULL DEFAULT 'SMK Penerbangan Dirghantara',
  school_address TEXT NOT NULL DEFAULT 'Jl. Megantara No. 1, Komplek Bandara',
  active_academic_year TEXT NOT NULL DEFAULT '2025/2026',
  active_semester TEXT NOT NULL DEFAULT 'Genap',
  wa_gateway_enabled INTEGER NOT NULL DEFAULT 0,
  wa_gateway_endpoint TEXT NOT NULL DEFAULT 'https://api.fonnte.com/send',
  wa_gateway_token TEXT DEFAULT '',
  wa_gateway_sender TEXT DEFAULT '081234567890',
  school_latitude REAL NOT NULL DEFAULT -6.9175,
  school_longitude REAL NOT NULL DEFAULT 107.6191,
  geofence_radius_meters REAL NOT NULL DEFAULT 150.0,
  work_start_hour TEXT NOT NULL DEFAULT '07:15',
  work_end_hour TEXT NOT NULL DEFAULT '15:30'
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  modul TEXT NOT NULL,
  action TEXT NOT NULL,
  detail TEXT NOT NULL,
  ip_address TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_created_idx ON audit_logs (created_at);
CREATE INDEX IF NOT EXISTS audit_modul_idx ON audit_logs (modul);
`);

console.log("✅ SIMESA SQLite tables initialized successfully!");
db.close();
