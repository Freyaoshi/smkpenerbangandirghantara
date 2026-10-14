import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isSuperAdmin } from "@/lib/permissions";

// GET /api/system/settings
export async function GET() {
  try {
    let [settings] = await db.select().from(systemSettings).where(eq(systemSettings.id, "main"));
    if (!settings) {
      const [created] = await db
        .insert(systemSettings)
        .values({
          id: "main",
          schoolName: "SMK Penerbangan Dirghantara",
        })
        .returning();
      settings = created;
    }
    return NextResponse.json(settings);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/system/settings — Super Admin only!
export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  // Modul A-03: Hanya Super Admin yang berwenang
  if (!session || !isSuperAdmin(appRole)) {
    return NextResponse.json(
      { error: "Akses Ditolak: Hanya Super Admin yang berwenang mengubah konfigurasi sistem" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      schoolName,
      schoolAddress,
      activeAcademicYear,
      activeSemester,
      waGatewayEnabled,
      waGatewayEndpoint,
      waGatewayToken,
      waGatewaySender,
      schoolLatitude,
      schoolLongitude,
      geofenceRadiusMeters,
      workStartHour,
      workEndHour,
    } = body;

    const [updated] = await db
      .update(systemSettings)
      .set({
        schoolName: schoolName !== undefined ? schoolName : undefined,
        schoolAddress: schoolAddress !== undefined ? schoolAddress : undefined,
        activeAcademicYear: activeAcademicYear !== undefined ? activeAcademicYear : undefined,
        activeSemester: activeSemester !== undefined ? activeSemester : undefined,
        waGatewayEnabled: waGatewayEnabled !== undefined ? Boolean(waGatewayEnabled) : undefined,
        waGatewayEndpoint: waGatewayEndpoint !== undefined ? waGatewayEndpoint : undefined,
        waGatewayToken: waGatewayToken !== undefined ? waGatewayToken : undefined,
        waGatewaySender: waGatewaySender !== undefined ? waGatewaySender : undefined,
        schoolLatitude: schoolLatitude !== undefined ? Number(schoolLatitude) : undefined,
        schoolLongitude: schoolLongitude !== undefined ? Number(schoolLongitude) : undefined,
        geofenceRadiusMeters: geofenceRadiusMeters !== undefined ? Number(geofenceRadiusMeters) : undefined,
        workStartHour: workStartHour !== undefined ? workStartHour : undefined,
        workEndHour: workEndHour !== undefined ? workEndHour : undefined,
      })
      .where(eq(systemSettings.id, "main"))
      .returning();

    // Audit Log
    await db.insert(auditLogs).values({
      userId: session.user.id,
      userName: session.user.name || "Super Admin",
      role: "SUPER_ADMIN",
      modul: "Konfigurasi Sistem",
      action: "UPDATE",
      detail: `Perubahan konfigurasi sistem (WA Gateway, Geofence ${geofenceRadiusMeters || ""}m)`,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
