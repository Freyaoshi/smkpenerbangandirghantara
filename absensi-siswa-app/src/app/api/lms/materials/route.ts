import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lmsMaterials } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isTeacherOrAdmin } from "@/lib/permissions";

// GET /api/lms/materials — get materials
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kelas = searchParams.get("kelas");
  const mapel = searchParams.get("mapel");

  try {
    let list = await db.select().from(lmsMaterials).orderBy(desc(lmsMaterials.createdAt)).all();
    if (kelas && kelas !== "all") {
      list = list.filter((m) => m.kelas.includes(kelas));
    }
    if (mapel && mapel !== "all") {
      list = list.filter((m) => m.mapel === mapel);
    }
    return NextResponse.json(list);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/lms/materials — upload new material
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isTeacherOrAdmin(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { mapel, kelas, judul, deskripsi, fileUrl, tipe } = body;

    if (!mapel || !kelas || !judul) {
      return NextResponse.json({ error: "Mapel, kelas, dan judul materi wajib" }, { status: 400 });
    }

    const [material] = await db
      .insert(lmsMaterials)
      .values({
        mapel,
        kelas,
        judul,
        deskripsi,
        fileUrl: fileUrl || "#",
        tipe: tipe || "Modul PDF",
        guruId: session.user.id,
        guruNama: session.user.name || "Guru",
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ success: true, material });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
