import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lmsAssignments, lmsSubmissions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isTeacherOrAdmin } from "@/lib/permissions";

// GET /api/lms/assignments — get assignments
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kelas = searchParams.get("kelas");

  try {
    let list = await db.select().from(lmsAssignments).orderBy(desc(lmsAssignments.createdAt)).all();
    if (kelas && kelas !== "all") {
      list = list.filter((a) => a.kelas.includes(kelas));
    }
    return NextResponse.json(list);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/lms/assignments — create assignment
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isTeacherOrAdmin(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { mapel, kelas, judul, deskripsi, tenggatWaktu } = body;

    if (!mapel || !kelas || !judul || !tenggatWaktu) {
      return NextResponse.json({ error: "Mapel, kelas, judul, dan tenggat waktu wajib" }, { status: 400 });
    }

    const [assignment] = await db
      .insert(lmsAssignments)
      .values({
        mapel,
        kelas,
        judul,
        deskripsi,
        tenggatWaktu,
        guruId: session.user.id,
        guruNama: session.user.name || "Guru",
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ success: true, assignment });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
