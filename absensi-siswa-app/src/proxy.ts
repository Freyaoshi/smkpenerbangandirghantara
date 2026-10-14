import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes and API routes
  if (
    pathname === "/login" ||
    pathname === "/" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie (Better Auth uses 'better-auth.session_token' locally and '__Secure-better-auth.session_token' in production HTTPS)
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  if (!sessionToken) {
    // No session → redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Validate session by calling Better Auth's getSession endpoint
  try {
    const sessionRes = await fetch(
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await sessionRes.json();
    const appRole = session?.user?.appRole as string | undefined;

    // RBAC: check if user has access to the requested route
    const role = (appRole || "").toUpperCase();
    const adminRoles = [
      "SUPER_ADMIN",
      "ADMIN",
      "KEPALA_SEKOLAH",
      "PETUGAS_PIKET",
      "GURU_BK",
      "PEMBINA_EKSKUL",
      "PUSTAKAWAN",
      "SARPRAS",
    ];
    const guruRoles = [
      "GURU",
      "WALI_KELAS",
      "PEMBINA_EKSKUL",
      "GURU_BK",
      "SUPER_ADMIN",
    ];

    if (pathname.startsWith("/admin") && !adminRoles.includes(role)) {
      const redirectPath = guruRoles.includes(role) ? "/guru" : "/siswa";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (pathname.startsWith("/guru") && !guruRoles.includes(role)) {
      const redirectPath = adminRoles.includes(role) ? "/admin" : "/siswa";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    if (pathname.startsWith("/siswa") && role !== "SISWA" && role !== "SUPER_ADMIN") {
      const redirectPath = adminRoles.includes(role) ? "/admin" : "/guru";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return NextResponse.next();
  } catch {
    // If session validation fails, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    // Match all paths except static files and api
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
