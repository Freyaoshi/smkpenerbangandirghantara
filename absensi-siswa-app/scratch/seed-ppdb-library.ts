import "dotenv/config";
import { db } from "../src/db/index";
import { ppdbApplications, libraryBooks, bookLoans, students } from "../src/db/schema";

async function seedPpdbAndLibrary() {
  console.log("🌱 Seeding PPDB & E-Library Data...");

  // 1. PPDB Data
  await db.delete(ppdbApplications).run();
  await db.insert(ppdbApplications).values([
    {
      id: crypto.randomUUID(),
      namaCalonSiswa: "Rizky Firmansyah",
      nisn: "0081234567",
      asalSekolah: "SMP Negeri 1 Jakarta",
      email: "rizky.f@gmail.com",
      noHp: "081298765432",
      statusVerifikasi: "Lolos",
      tanggalDaftar: "2026-02-10"
    },
    {
      id: crypto.randomUUID(),
      namaCalonSiswa: "Alya Zahra",
      nisn: "0087654321",
      asalSekolah: "SMP Negeri 5 Bandung",
      email: "alya.z@gmail.com",
      noHp: "081345678901",
      statusVerifikasi: "Pending",
      tanggalDaftar: "2026-02-15"
    },
    {
      id: crypto.randomUUID(),
      namaCalonSiswa: "Farhan Mahendra",
      nisn: "0089998887",
      asalSekolah: "SMP Islam Terpadu Bogor",
      email: "farhan.m@gmail.com",
      noHp: "081567890123",
      statusVerifikasi: "Pending",
      tanggalDaftar: "2026-02-18"
    }
  ]).run();

  // 2. Library Books
  await db.delete(libraryBooks).run();
  const b1 = crypto.randomUUID();
  const b2 = crypto.randomUUID();
  const b3 = crypto.randomUUID();

  await db.insert(libraryBooks).values([
    {
      id: b1,
      judulBuku: "Algoritma & Pemrograman Modern (Sistem Rekayasa Web)",
      pengarang: "Prof. Ir. Rinaldi Munir",
      kategori: "Pelajaran",
      stok: 10,
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=60",
      isAvailable: true
    },
    {
      id: b2,
      judulBuku: "Sistem Pendukung Keputusan (SPK SAW & TOPSIS dalam Pendidikan)",
      pengarang: "Dr. Budi Raharjo",
      kategori: "Sains",
      stok: 8,
      coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&auto=format&fit=crop&q=60",
      isAvailable: true
    },
    {
      id: b3,
      judulBuku: "Fisika Modern & Aplikasi Quantum Computing",
      pengarang: "Dr. Bambang Hidayat",
      kategori: "Sains",
      stok: 5,
      coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=60",
      isAvailable: true
    }
  ]).run();

  // 3. Book Loans
  const allStudents = await db.select().from(students).all();
  if (allStudents.length > 0) {
    await db.delete(bookLoans).run();
    await db.insert(bookLoans).values([
      {
        id: crypto.randomUUID(),
        bookId: b1,
        studentId: allStudents[0].id,
        tanggalPinjam: "2026-03-01",
        tanggalKembali: "2026-03-08",
        status: "Dipinjam"
      }
    ]).run();
  }

  console.log("✨ PPDB & E-Library Seeded Successfully!");
}

seedPpdbAndLibrary().catch(console.error);
