import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isSuperAdmin, isAdminOrSuperAdmin } from "@/lib/permissions";

// GET /api/auth-accounts — list all registered accounts
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isAdminOrSuperAdmin(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await db.select().from(user).all();
  return NextResponse.json(result);
}

// POST /api/auth-accounts — create a new user account (Super Admin only)
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isSuperAdmin(appRole)) {
    return NextResponse.json(
      { error: "Hanya Super Admin yang berwenang membuat akun pengguna baru" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { name, username, email, password, targetRole } = body;

    if (!name || !username || !password || !targetRole) {
      return NextResponse.json(
        { error: "Nama, username, password, dan peran wajib diisi" },
        { status: 400 }
      );
    }

    const emailValue = email || `${username}@dirghantara.sch.id`;

    const newUser = await auth.api.signUpEmail({
      body: {
        email: emailValue,
        password,
        name,
        username,
        appRole: targetRole.toUpperCase(),
      },
    });

    return NextResponse.json({ success: true, user: newUser.user });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Gagal membuat akun pengguna" },
      { status: 500 }
    );
  }
}
