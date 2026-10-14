import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ekskulScores, students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isStaffRole } from "@/lib/permissions";

// GET /api/ekskul — list ekskul & achievement scores
export async function GET() {
  try {
    const list = await db.select().from(ekskulScores).all();
    const allStudents = await db.select().from(students).all();
    const studentMap = new Map(allStudents.map((s) => [s.id, s]));

    const enriched = list.map((e) => {
      const student = studentMap.get(e.studentId);
      return {
        ...e,
        namaSiswa: student?.namaLengkap || "Siswa",
        nis: student?.nis || "-",
        kelas: student?.kelas || "-",
        programKeahlian: student?.programKeahlian || "-",
      };
    });

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/ekskul — input or update C4 & C5 scores
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isStaffRole(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { studentId, namaEkskul, nilaiKeaktifan, prestasiNama, nilaiPrestasi, catatan } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Siswa wajib dipilih" }, { status: 400 });
    }

    // Check if score exists for this student
    const [existing] = await db
      .select()
      .from(ekskulScores)
      .where(eq(ekskulScores.studentId, studentId));

    if (existing) {
      const [updated] = await db
        .update(ekskulScores)
        .set({
          namaEkskul: namaEkskul || existing.namaEkskul,
          nilaiKeaktifan: Number(nilaiKeaktifan) || existing.nilaiKeaktifan,
          prestasiNama: prestasiNama !== undefined ? prestasiNama : existing.prestasiNama,
          nilaiPrestasi: Number(nilaiPrestasi) || existing.nilaiPrestasi,
          catatan: catatan || existing.catatan,
          inputtedBy: session.user.name || "Pembina Ekskul",
        })
        .where(eq(ekskulScores.id, existing.id))
        .returning();

      return NextResponse.json({ success: true, record: updated });
    } else {
      const [created] = await db
        .insert(ekskulScores)
        .values({
          studentId,
          periode: "2025/2026-Genap",
          namaEkskul: namaEkskul || "Aero Modeling",
          nilaiKeaktifan: Number(nilaiKeaktifan) || 80,
          prestasiNama: prestasiNama || null,
          nilaiPrestasi: Number(nilaiPrestasi) || 75,
          catatan: catatan || null,
          inputtedBy: session.user.name || "Pembina Ekskul",
        })
        .returning();

      return NextResponse.json({ success: true, record: created });
    }
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
