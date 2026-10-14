import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sarprasFacilities, sarprasSchedules } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isStaffRole } from "@/lib/permissions";

// GET /api/sarpras — get facilities and schedules
export async function GET() {
  try {
    const facilities = await db.select().from(sarprasFacilities).all();
    const schedules = await db
      .select()
      .from(sarprasSchedules)
      .orderBy(desc(sarprasSchedules.tanggal))
      .all();

    const facilityMap = new Map(facilities.map((f) => [f.id, f]));
    const enrichedSchedules = schedules.map((s) => ({
      ...s,
      namaFasilitas: facilityMap.get(s.facilityId)?.namaFasilitas || "Fasilitas Bengkel",
    }));

    return NextResponse.json({
      facilities,
      schedules: enrichedSchedules,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/sarpras — schedule facility usage or add facility
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isStaffRole(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "schedule") {
      const { facilityId, kelas, tanggal, jamMulai, jamSelesai, guruPengampu, keperluan } = body;
      const [schedule] = await db
        .insert(sarprasSchedules)
        .values({
          facilityId,
          kelas,
          tanggal,
          jamMulai,
          jamSelesai,
          guruPengampu: guruPengampu || session.user.name || "Guru",
          keperluan,
          status: "Dijadwalkan",
        })
        .returning();

      return NextResponse.json({ success: true, schedule });
    }

    if (action === "add_facility") {
      const { namaFasilitas, kode, kategori, kapasitas, penanggungJawab, sopKeselamatan } = body;
      const [facility] = await db
        .insert(sarprasFacilities)
        .values({
          namaFasilitas,
          kode,
          kategori,
          kapasitas: Number(kapasitas) || 36,
          penanggungJawab: penanggungJawab || session.user.name,
          sopKeselamatan,
          kondisi: "Siap Pakai",
        })
        .returning();

      return NextResponse.json({ success: true, facility });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
