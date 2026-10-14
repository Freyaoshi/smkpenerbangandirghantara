import "dotenv/config";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
});

async function sync() {
  console.log("Syncing database tables...");
  await client.execute(`CREATE TABLE IF NOT EXISTS teacher_attendance (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    tanggal TEXT NOT NULL,
    waktu_masuk TEXT NOT NULL,
    waktu_pulang TEXT,
    status TEXT NOT NULL DEFAULT 'Hadir',
    photo_url TEXT,
    confidence_score REAL DEFAULT 0.98,
    lokasi TEXT DEFAULT 'Gedung Utama (Kamera Gerbang 1)'
  );`);

  await client.execute(`CREATE TABLE IF NOT EXISTS violations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    jenis_pelanggaran TEXT NOT NULL,
    poin_minus REAL NOT NULL DEFAULT 5,
    kategori TEXT NOT NULL DEFAULT 'Kedisiplinan',
    tanggal TEXT NOT NULL,
    catatan TEXT,
    reported_by TEXT
  );`);

  await client.execute(`CREATE TABLE IF NOT EXISTS e_rapor (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    periode TEXT NOT NULL,
    catatan_wali TEXT,
    status_review TEXT NOT NULL DEFAULT 'Normal',
    pesan_review TEXT,
    reviewed_at TEXT,
    reviewed_by TEXT
  );`);

  await client.execute(`CREATE TABLE IF NOT EXISTS mading_posts (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    konten TEXT NOT NULL,
    kategori TEXT NOT NULL DEFAULT 'Pengumuman',
    author_name TEXT NOT NULL DEFAULT 'Admin Sekolah',
    is_pinned INTEGER NOT NULL DEFAULT 0,
    tanggal TEXT NOT NULL,
    tanggal_expired TEXT,
    image_url TEXT
  );`);

  await client.execute(`CREATE TABLE IF NOT EXISTS lab_schedules (
    id TEXT PRIMARY KEY,
    nama_lab TEXT NOT NULL,
    mapel TEXT NOT NULL,
    guru_id TEXT NOT NULL,
    nama_guru TEXT NOT NULL,
    tanggal TEXT NOT NULL,
    jam_mulai TEXT NOT NULL,
    jam_selesai TEXT NOT NULL,
    topik_praktikum TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Disetujui',
    inventaris_alat TEXT
  );`);

  console.log("✅ Database sync complete!");
}

sync().catch(console.error);
