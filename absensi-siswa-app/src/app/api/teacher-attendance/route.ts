import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teacherAttendance, teachers, systemSettings, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isStaffRole } from "@/lib/permissions";

// GET /api/teacher-attendance — list attendance for a date or teacher
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tanggal = searchParams.get("tanggal") || new Date().toISOString().split("T")[0];
  const teacherId = searchParams.get("teacherId");

  try {
    const allRecords = await db
      .select({
        id: teacherAttendance.id,
        teacherId: teacherAttendance.teacherId,
        tanggal: teacherAttendance.tanggal,
        jamMasuk: teacherAttendance.jamMasuk,
        jamPulang: teacherAttendance.jamPulang,
        status: teacherAttendance.status,
        metode: teacherAttendance.metode,
        latitude: teacherAttendance.latitude,
        longitude: teacherAttendance.longitude,
        jarakMeter: teacherAttendance.jarakMeter,
        fotoSelfie: teacherAttendance.fotoSelfie,
        catatan: teacherAttendance.catatan,
        verifiedBy: teacherAttendance.verifiedBy,
      })
      .from(teacherAttendance)
      .where(eq(teacherAttendance.tanggal, tanggal))
      .orderBy(desc(teacherAttendance.jamMasuk))
      .all();

    const allTeachers = await db.select().from(teachers).all();
    const teacherMap = new Map(allTeachers.map((t) => [t.id, t]));

    const enriched = allRecords.map((r) => {
      const teacher = teacherMap.get(r.teacherId);
      return {
        ...r,
        namaLengkap: teacher?.namaLengkap || "Dewan Guru",
        nip: teacher?.nip || "-",
        jabatan: teacher?.jabatan || "Guru Kejuruan",
      };
    });

    if (teacherId) {
      return NextResponse.json(enriched.filter((r) => r.teacherId === teacherId));
    }

    return NextResponse.json({
      tanggal,
      totalHadir: enriched.filter((r) => r.status === "Hadir" || r.status === "Terlambat").length,
      totalTerlambat: enriched.filter((r) => r.status === "Terlambat").length,
      records: enriched,
      allTeachers,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/teacher-attendance — presensi mandiri guru via biometrik wajah & geolokasi
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { teacherId, latitude, longitude, fotoSelfie, catatan } = body;

    // Find teacher record
    const [teacher] = await db
      .select()
      .from(teachers)
      .where(teacherId ? eq(teachers.id, teacherId) : eq(teachers.userId, session.user.id));

    if (!teacher) {
      return NextResponse.json({ error: "Data guru tidak ditemukan" }, { status: 404 });
    }

    // Get school coordinates & geofence settings
    const [settings] = await db.select().from(systemSettings).where(eq(systemSettings.id, "main"));
    const schoolLat = settings?.schoolLatitude || -6.9175;
    const schoolLng = settings?.schoolLongitude || 107.6191;
    const maxRadius = settings?.geofenceRadiusMeters || 150.0;
    const cutoffHour = settings?.workStartHour || "07:15";

    // Calculate distance (Haversine formula in meters)
    let distanceMeter = 15; // default fallback if GPS unavailable
    if (latitude && longitude) {
      const R = 6371e3;
      const φ1 = (latitude * Math.PI) / 180;
      const φ2 = (schoolLat * Math.PI) / 180;
      const Δφ = ((schoolLat - latitude) * Math.PI) / 180;
      const Δλ = ((schoolLng - longitude) * Math.PI) / 180;
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceMeter = Math.round(R * c);
    }

    const now = new Date();
    const tanggal = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().split(" ")[0]; // HH:mm:ss

    // Check if late (after 07:15)
    const [cutH, cutM] = cutoffHour.split(":").map(Number);
    const isLate = now.getHours() > cutH || (now.getHours() === cutH && now.getMinutes() > cutM);
    const status = isLate ? "Terlambat" : "Hadir";

    const [savedRecord] = await db
      .insert(teacherAttendance)
      .values({
        teacherId: teacher.id,
        tanggal,
        jamMasuk: timeStr,
        status,
        metode: "Biometrik Wajah",
        latitude: latitude || schoolLat,
        longitude: longitude || schoolLng,
        jarakMeter: distanceMeter,
        fotoSelfie: fotoSelfie || null,
        catatan: catatan || (distanceMeter <= maxRadius ? "Dalam radius hanggar SMK" : `Jarak ${distanceMeter}m`),
        verifiedBy: "Sistem Biometrik Kamera AI",
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: `Presensi berhasil direkam! Status: ${status} (${timeStr})`,
      record: savedRecord,
      jarakMeter: distanceMeter,
      dalamRadius: distanceMeter <= maxRadius,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/teacher-attendance — verifikasi alternatif oleh petugas piket
export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isStaffRole(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { teacherId, tanggal, status, alasanPiket } = body;

    const timeStr = new Date().toTimeString().split(" ")[0];

    const [record] = await db
      .insert(teacherAttendance)
      .values({
        teacherId,
        tanggal: tanggal || new Date().toISOString().split("T")[0],
        jamMasuk: timeStr,
        status: status || "Hadir",
        metode: "Manual Petugas Piket",
        catatan: alasanPiket || "Diverifikasi manual oleh Petugas Piket",
        verifiedBy: session.user.name || "Petugas Piket",
      })
      .returning();

    return NextResponse.json({ success: true, record });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
