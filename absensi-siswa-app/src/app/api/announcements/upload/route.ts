import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isAdminOrSuperAdmin } from "@/lib/permissions";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isAdminOrSuperAdmin(appRole)) {
    return NextResponse.json({ error: "Forbidden: Hanya admin yang dapat mengunggah gambar" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File gambar tidak ditemukan" }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah gambar JPG, PNG, WEBP, GIF, atau SVG." },
        { status: 400 }
      );
    }

    // Max 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimum ukuran gambar adalah 5 MB." },
        { status: 400 }
      );
    }

    // Prepare upload directory in public/uploads/mading
    const uploadDir = path.join(process.cwd(), "public", "uploads", "mading");
    await fs.mkdir(uploadDir, { recursive: true });

    // Sanitize extension
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpeg", "jpg", "png", "webp", "gif", "svg"].includes(extension) ? extension : "jpg";
    const filename = `mading-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${safeExt}`;
    const filePath = path.join(uploadDir, filename);

    // Save buffer
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    const imageUrl = `/uploads/mading/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
      filename,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || "Gagal mengunggah gambar" }, { status: 500 });
  }
}
