import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { counselingRecords, students, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isSuperAdmin } from "@/lib/permissions";

// GET /api/counseling — list counseling records (Restricted for confidentiality)
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  // Modul L-03: Kerahasiaan bimbingan konseling
  if (!session || (appRole !== "GURU_BK" && !isSuperAdmin(appRole))) {
    return NextResponse.json(
      { error: "Akses terbatas: Data bimbingan konseling bersifat rahasia untuk Guru BK" },
      { status: 403 }
    );
  }

  try {
    const allRecords = await db
      .select()
      .from(counselingRecords)
      .orderBy(desc(counselingRecords.tanggal))
      .all();

    const allStudents = await db.select().from(students).all();
    const studentMap = new Map(allStudents.map((s) => [s.id, s]));

    const enriched = allRecords.map((r) => {
      const student = studentMap.get(r.studentId);
      return {
        ...r,
        namaSiswa: student?.namaLengkap || "Siswa",
        nis: student?.nis || "-",
        kelas: student?.kelas || "-",
      };
    });

    return NextResponse.json(enriched);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/counseling — record counseling session
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || (appRole !== "GURU_BK" && !isSuperAdmin(appRole))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { studentId, tanggal, jenisBimbingan, ringkasanMasalah, tindakLanjut, status, catatanRahasia } = body;

    if (!studentId || !ringkasanMasalah) {
      return NextResponse.json({ error: "Siswa dan ringkasan masalah wajib diisi" }, { status: 400 });
    }

    const [record] = await db
      .insert(counselingRecords)
      .values({
        studentId,
        counselorId: session.user.id,
        tanggal: tanggal || new Date().toISOString().split("T")[0],
        jenisBimbingan: jenisBimbingan || "Pribadi",
        ringkasanMasalah,
        tindakLanjut: tindakLanjut || "Sesi bimbingan lanjutan",
        status: status || "Dalam Proses",
        catatanRahasia: catatanRahasia || null,
      })
      .returning();

    return NextResponse.json({ success: true, record });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
