import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const dbUrl = process.env.TURSO_DATABASE_URL || "";
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;
  const betterAuthUrl = process.env.BETTER_AUTH_URL || "";
  
  let scheme = "unknown";
  if (dbUrl.startsWith("libsql://")) scheme = "libsql (Turso Cloud)";
  else if (dbUrl.startsWith("file:")) scheme = "file (Local SQLite)";
  else if (dbUrl) scheme = dbUrl.split(":")[0];

  let dbStatus = "unknown";
  let errorMessage: string | null = null;
  let userCount = 0;
  let hasSuperAdmin = false;

  try {
    // Check if we can query sqlite_master / tables
    const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);
    dbStatus = "CONNECTED";

    // Check users
    try {
      const userRows = (await db.run(sql`SELECT username, email, app_role FROM user`)) as unknown as {
        rows: Array<{ username: string; email: string; app_role: string }>;
      };
      const rows = userRows.rows || [];
      userCount = rows.length;
      hasSuperAdmin = rows.some(
        (u) => u.username === "superadmin01" || u.app_role === "SUPER_ADMIN"
      );
    } catch (e: unknown) {
      const err = e as Error;
      errorMessage = `Tabel user belum ada atau error: ${err.message}`;
    }
  } catch (err: unknown) {
    const error = err as Error;
    dbStatus = "FAILED";
    errorMessage = error.message;
  }

  return NextResponse.json({
    status: dbStatus,
    config: {
      tursoDatabaseUrlSet: !!dbUrl,
      databaseScheme: scheme,
      tursoAuthTokenSet: hasToken,
      betterAuthUrl,
    },
    database: {
      userCount,
      hasSuperAdmin,
      error: errorMessage,
    },
    diagnosis: !hasToken && scheme.includes("libsql")
      ? "TURSO_AUTH_TOKEN belum dipasang di Vercel Environment Variables!"
      : scheme.includes("file")
      ? "Database masih menggunakan 'file:sqlite.db'. Di Vercel (serverless), file lokal tidak ada dan bersifat read-only. Anda harus menggunakan database cloud Turso (libsql://...)."
      : userCount === 0
      ? "Database terhubung tapi masih kosong (belum di-push skema atau di-seed). Jalankan 'npx drizzle-kit push' dan 'npx tsx src/db/seed.ts'."
      : "Database terhubung dan siap digunakan.",
  });
}
