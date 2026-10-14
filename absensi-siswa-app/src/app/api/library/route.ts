import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { libraryBooks, libraryLoans, students } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { isStaffRole } from "@/lib/permissions";

// GET /api/library — get books & loans
export async function GET() {
  try {
    const books = await db.select().from(libraryBooks).all();
    const loans = await db.select().from(libraryLoans).orderBy(desc(libraryLoans.tanggalPinjam)).all();
    const allStudents = await db.select().from(students).all();
    const studentMap = new Map(allStudents.map((s) => [s.id, s]));
    const bookMap = new Map(books.map((b) => [b.id, b]));

    const enrichedLoans = loans.map((l) => {
      const student = studentMap.get(l.studentId);
      const book = bookMap.get(l.bookId);
      return {
        ...l,
        namaSiswa: student?.namaLengkap || "Siswa",
        nis: student?.nis || "-",
        kelas: student?.kelas || "-",
        judulBuku: book?.judul || "Buku",
        kodeBuku: book?.kodeBuku || "-",
      };
    });

    return NextResponse.json({
      books,
      loans: enrichedLoans,
      totalBuku: books.reduce((acc, b) => acc + b.totalStok, 0),
      bukuDipinjam: loans.filter((l) => l.status === "Dipinjam").length,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/library — borrow, return, or add book
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const appRole = (session?.user as Record<string, unknown>)?.appRole as string | undefined;

  if (!session || !isStaffRole(appRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    if (action === "borrow") {
      const { bookId, studentId, durasiHari } = body;
      const today = new Date();
      const tenggat = new Date(today);
      tenggat.setDate(tenggat.getDate() + (durasiHari || 7));

      const [book] = await db.select().from(libraryBooks).where(eq(libraryBooks.id, bookId));
      if (!book || book.stokTersedia <= 0) {
        return NextResponse.json({ error: "Stok buku tidak tersedia" }, { status: 400 });
      }

      // Decrement stock
      await db
        .update(libraryBooks)
        .set({ stokTersedia: book.stokTersedia - 1 })
        .where(eq(libraryBooks.id, bookId));

      const [loan] = await db
        .insert(libraryLoans)
        .values({
          bookId,
          studentId,
          tanggalPinjam: today.toISOString().split("T")[0],
          tenggatKembali: tenggat.toISOString().split("T")[0],
          status: "Dipinjam",
          petugas: session.user.name || "Pustakawan",
        })
        .returning();

      return NextResponse.json({ success: true, loan });
    }

    if (action === "return") {
      const { loanId } = body;
      const [loan] = await db.select().from(libraryLoans).where(eq(libraryLoans.id, loanId));
      if (!loan) {
        return NextResponse.json({ error: "Peminjaman tidak ditemukan" }, { status: 404 });
      }

      const todayStr = new Date().toISOString().split("T")[0];

      // Increment stock
      const [book] = await db.select().from(libraryBooks).where(eq(libraryBooks.id, loan.bookId));
      if (book) {
        await db
          .update(libraryBooks)
          .set({ stokTersedia: book.stokTersedia + 1 })
          .where(eq(libraryBooks.id, book.id));
      }

      await db
        .update(libraryLoans)
        .set({ status: "Kembali", tanggalKembali: todayStr })
        .where(eq(libraryLoans.id, loanId));

      return NextResponse.json({ success: true, message: "Buku berhasil dikembalikan" });
    }

    if (action === "add_book") {
      const { kodeBuku, judul, pengarang, penerbit, tahun, kategori, totalStok, lokasiRak } = body;
      const [book] = await db
        .insert(libraryBooks)
        .values({
          kodeBuku,
          judul,
          pengarang,
          penerbit: penerbit || "Penerbit Aviasi",
          tahun: tahun || "2024",
          kategori: kategori || "Kejuruan AP",
          totalStok: Number(totalStok) || 1,
          stokTersedia: Number(totalStok) || 1,
          lokasiRak: lokasiRak || "Rak A-1",
        })
        .returning();

      return NextResponse.json({ success: true, book });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
