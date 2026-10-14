import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config();

const client = createClient({ url: "file:local.db" });

async function syncAll() {
  console.log("Checking all table columns in local.db...");

  const alterStatements = [
    // mading_posts
    "ALTER TABLE mading_posts ADD COLUMN tanggal_expired TEXT",
    "ALTER TABLE mading_posts ADD COLUMN image_url TEXT",
    // teacher_attendance
    "ALTER TABLE teacher_attendance ADD COLUMN waktu_masuk TEXT",
    "ALTER TABLE teacher_attendance ADD COLUMN waktu_pulang TEXT",
    "ALTER TABLE teacher_attendance ADD COLUMN confidence_score REAL",
    "ALTER TABLE teacher_attendance ADD COLUMN lokasi TEXT",
    // violations
    "ALTER TABLE violations ADD COLUMN poin_minus REAL",
    "ALTER TABLE violations ADD COLUMN kategori TEXT",
    "ALTER TABLE violations ADD COLUMN reported_by TEXT",
    // e_rapor
    "ALTER TABLE e_rapor ADD COLUMN status_review TEXT",
    "ALTER TABLE e_rapor ADD COLUMN pesan_review TEXT",
    "ALTER TABLE e_rapor ADD COLUMN reviewed_at TEXT",
    "ALTER TABLE e_rapor ADD COLUMN reviewed_by TEXT",
  ];

  for (const sql of alterStatements) {
    try {
      await client.execute(sql);
      console.log("Executed:", sql);
    } catch (e: any) {
      // Column already exists, safe to ignore
    }
  }

  console.log("All schemas fully synchronized!");
}

syncAll();
