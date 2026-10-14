import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teacherEvaluations, teachers } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/evaluations — get teacher evaluations summary
export async function GET() {
  try {
    const list = await db.select().from(teacherEvaluations).all();
    const allTeachers = await db.select().from(teachers).all();

    // Group scores per teacher
    const teacherStats: Record<
      string,
      {
        teacherId: string;
        namaGuru: string;
        nip: string;
        jabatan: string;
        count: number;
        avgPedagogik: number;
        avgProfesional: number;
        avgKepribadian: number;
        avgSosial: number;
        totalAvg: number;
        saranList: string[];
      }
    > = {};

    allTeachers.forEach((t) => {
      teacherStats[t.id] = {
        teacherId: t.id,
        namaGuru: t.namaLengkap,
        nip: t.nip,
        jabatan: t.jabatan || "Dewan Guru",
        count: 0,
        avgPedagogik: 0,
        avgProfesional: 0,
        avgKepribadian: 0,
        avgSosial: 0,
        totalAvg: 0,
        saranList: [],
      };
    });

    list.forEach((e) => {
      if (teacherStats[e.teacherId]) {
        const item = teacherStats[e.teacherId];
        item.count += 1;
        item.avgPedagogik += e.skorPedagogik;
        item.avgProfesional += e.skorProfesional;
        item.avgKepribadian += e.skorKepribadian;
        item.avgSosial += e.skorSosial;
        if (e.saran) item.saranList.push(e.saran);
      }
    });

    // Compute averages
    Object.values(teacherStats).forEach((item) => {
      if (item.count > 0) {
        item.avgPedagogik = Number((item.avgPedagogik / item.count).toFixed(2));
        item.avgProfesional = Number((item.avgProfesional / item.count).toFixed(2));
        item.avgKepribadian = Number((item.avgKepribadian / item.count).toFixed(2));
        item.avgSosial = Number((item.avgSosial / item.count).toFixed(2));
        item.totalAvg = Number(
          ((item.avgPedagogik + item.avgProfesional + item.avgKepribadian + item.avgSosial) / 4).toFixed(2)
        );
      }
    });

    return NextResponse.json({
      summary: Object.values(teacherStats),
      totalResponden: list.length,
      allTeachers,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/evaluations — student submits evaluation
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { studentId, teacherId, mapel, skorPedagogik, skorProfesional, skorKepribadian, skorSosial, saran } = body;

    if (!teacherId || !mapel) {
      return NextResponse.json({ error: "Guru dan mata pelajaran wajib dipilih" }, { status: 400 });
    }

    const [evaluation] = await db
      .insert(teacherEvaluations)
      .values({
        studentId: studentId || session.user.id,
        teacherId,
        mapel,
        periode: "2025/2026-Genap",
        skorPedagogik: Number(skorPedagogik) || 4,
        skorProfesional: Number(skorProfesional) || 4,
        skorKepribadian: Number(skorKepribadian) || 4,
        skorSosial: Number(skorSosial) || 4,
        saran: saran || null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({ success: true, evaluation });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
