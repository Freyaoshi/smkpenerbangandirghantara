import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { disciplineViolations, students, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isStaffRole } from "@/lib/permissions";

// GET /api/discipline — list violations
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const kelas = searchParams.get("kelas");

  try {
    const allViolations = await db
      .select()
      .from(disciplineViolations)
      .orderBy(desc(disciplineViolations.tanggal))
      .all();

    const allStudents = await db.select().from(students).all();
    const studentMap = new Map(allStudents.map((s) => [s.id, s]));

    // Enrich with student details
    const enriched = allViolations.map((v) => {
      const student = studentMap.get(v.studentId);
      return {
        ...v,
        namaSiswa: student?.namaLengkap || "Siswa",
        nis: student?.nis || "-",
        kelas: student?.kelas || "-",
        programKeahlian: student?.programKeahlian || "-",
      };
    });

    let filtered = enriched;
    if (studentId) {
      filtered = filtered.filter((v) => v.studentId === studentId);
    }
    if (kelas && kelas !== "all") {
      filtered = filtered.filter((v) => v.kelas === kelas);
    }

    // Calculate total points per student
    const pointsPerStudent: Record<string, { totalPoin: number; statusSP: string; nama: string; kelas: string; nis: string }> = {};
    allStudents.forEach((s) => {
      pointsPerStudent[s.id] = { totalPoin: 0, statusSP: "Aman", nama: s.namaLengkap, kelas: s.kelas, nis: s.nis };
    });
    allViolations.forEach((v) => {
      if (pointsPerStudent[v.studentId]) {
        pointsPerStudent[v.studentId].totalPoin += v.poin;
        const pts = pointsPerStudent[v.studentId].totalPoin;
        if (pts >= 100) pointsPerStudent[v.studentId].statusSP = "Sidang Pleno";
        else if (pts >= 75) pointsPerStudent[v.studentId].statusSP = "SP 3";
        else if (pts >= 55) pointsPerStudent[v.studentId].statusSP = "SP 2";
        else if (pts >= 30) pointsPerStudent[v.studentId].statusSP = "SP 1";
      }
    });

    return NextResponse.json({
      violations: filtered,
      studentSummary: Object.values(pointsPerStudent),
      allStudents,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/discipline — record new violation
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isStaffRole(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { studentId, tanggal, namaPelanggaran, kategori, poin, tindakan, sanksi } = body;

    if (!studentId || !namaPelanggaran || !poin) {
      return NextResponse.json(
        { error: "Siswa, nama pelanggaran, dan poin wajib diisi" },
        { status: 400 }
      );
    }

    // Get current total points for this student
    const prev = await db
      .select()
      .from(disciplineViolations)
      .where(eq(disciplineViolations.studentId, studentId))
      .all();
    const curTotal = prev.reduce((acc, curr) => acc + curr.poin, 0) + Number(poin);

    let statusSP: "None" | "SP 1" | "SP 2" | "SP 3" | "Pleno" = "None";
    if (curTotal >= 100) statusSP = "Pleno";
    else if (curTotal >= 75) statusSP = "SP 3";
    else if (curTotal >= 55) statusSP = "SP 2";
    else if (curTotal >= 30) statusSP = "SP 1";

    const [record] = await db
      .insert(disciplineViolations)
      .values({
        studentId,
        tanggal: tanggal || new Date().toISOString().split("T")[0],
        namaPelanggaran,
        kategori: kategori || "Ringan",
        poin: Number(poin),
        tindakan: tindakan || "Pembinaan oleh Guru BK",
        sanksi: sanksi || "Teguran",
        statusSP,
        reportedBy: session.user.name || "Petugas BK / Kesiswaan",
      })
      .returning();

    // Log to audit trail
    await db.insert(auditLogs).values({
      userId: session.user.id,
      userName: session.user.name || "Staf",
      role: appRole || "STAF",
      modul: "Buku Saku BK",
      action: "CREATE",
      detail: `Input pelanggaran '${namaPelanggaran}' (${poin} poin) untuk siswa ID ${studentId}. Status SP: ${statusSP}`,
    });

    return NextResponse.json({ success: true, record, curTotal, statusSP });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
