import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schoolAnnouncements, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isAdminOrSuperAdmin } from "@/lib/permissions";

// GET /api/announcements — all users can view published announcements
export async function GET() {
  try {
    const list = await db
      .select()
      .from(schoolAnnouncements)
      .where(eq(schoolAnnouncements.isPublished, true))
      .orderBy(desc(schoolAnnouncements.createdAt))
      .all();

    return NextResponse.json(list);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/announcements — create new announcement
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isAdminOrSuperAdmin(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { judul, kategori, konten, prioritas, tanggalMulai, tanggalSelesai } = body;

    if (!judul || !konten || !kategori) {
      return NextResponse.json({ error: "Judul, kategori, dan konten wajib diisi" }, { status: 400 });
    }

    const [record] = await db
      .insert(schoolAnnouncements)
      .values({
        judul,
        kategori,
        konten,
        prioritas: prioritas || "Normal",
        tanggalMulai: tanggalMulai || new Date().toISOString().split("T")[0],
        tanggalSelesai: tanggalSelesai || null,
        isPublished: true,
        authorName: session.user.name || "Humas Dirghantara",
        createdAt: new Date().toISOString(),
      })
      .returning();

    // Audit trail
    await db.insert(auditLogs).values({
      userId: session.user.id,
      userName: session.user.name || "Admin",
      role: appRole || "ADMIN",
      modul: "Mading Sekolah",
      action: "CREATE",
      detail: `Publikasi mading '${judul}' kategori ${kategori}`,
    });

    return NextResponse.json({ success: true, record });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/announcements?id=...
export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isAdminOrSuperAdmin(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });

  await db.delete(schoolAnnouncements).where(eq(schoolAnnouncements.id, id));
  return NextResponse.json({ success: true });
}
