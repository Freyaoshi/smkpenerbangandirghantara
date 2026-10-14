import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lmsSubmissions, students } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/lms/submissions — get submissions for assignment or student
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("assignmentId");
  const studentId = searchParams.get("studentId");

  try {
    let list = await db.select().from(lmsSubmissions).orderBy(desc(lmsSubmissions.submittedAt)).all();
    if (assignmentId) list = list.filter((s) => s.assignmentId === assignmentId);
    if (studentId) list = list.filter((s) => s.studentId === studentId);

    const allStudents = await db.select().from(students).all();
    const studentMap = new Map(allStudents.map((s) => [s.id, s]));

    const enriched = list.map((sub) => {
      const student = studentMap.get(sub.studentId);
      return {
        ...sub,
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

// POST /api/lms/submissions — submit assignment or update score
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { action } = body;

    // Student submits assignment
    if (action === "submit") {
      const { assignmentId, studentId, catatan, fileUrl } = body;
      const [submission] = await db
        .insert(lmsSubmissions)
        .values({
          assignmentId,
          studentId,
          catatan: catatan || "Tugas mandiri dikumpulkan",
          fileUrl: fileUrl || "#",
          submittedAt: new Date().toISOString(),
        })
        .returning();

      return NextResponse.json({ success: true, submission });
    }

    // Teacher grades submission
    if (action === "grade") {
      const { submissionId, nilai, feedback } = body;
      await db
        .update(lmsSubmissions)
        .set({ nilai: Number(nilai), feedback })
        .where(eq(lmsSubmissions.id, submissionId));

      return NextResponse.json({ success: true, message: "Nilai berhasil disimpan" });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
