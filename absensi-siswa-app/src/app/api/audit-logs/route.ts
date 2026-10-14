import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isSuperAdmin } from "@/lib/permissions";

// GET /api/audit-logs — Super Admin & Kepala Sekolah only!
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  const role = (appRole || "").toUpperCase();
  if (!session || (role !== "SUPER_ADMIN" && role !== "KEPALA_SEKOLAH")) {
    return NextResponse.json(
      { error: "Akses Ditolak: Hanya Super Admin dan Kepala Sekolah yang dapat mengakses Audit Trail" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const modul = searchParams.get("modul");
  const limit = Number(searchParams.get("limit")) || 50;

  try {
    let logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).all();
    if (modul && modul !== "all") {
      logs = logs.filter((l) => l.modul.toLowerCase().includes(modul.toLowerCase()));
    }
    return NextResponse.json(logs);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/audit-logs — insert audit log
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { modul, action, detail } = body;

    const [log] = await db
      .insert(auditLogs)
      .values({
        userId: session.user.id,
        userName: session.user.name || "Pengguna",
        role: (session.user as Record<string, unknown>).appRole as string || "STAF",
        modul: modul || "Umum",
        action: action || "UPDATE",
        detail: detail || "Perubahan data",
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ success: true, log });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
