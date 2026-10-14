# PRD — SIMESA: Sistem Informasi Manajemen Elektronik Sekolah dan Administrasi
## SMK Penerbangan Dirghantara

> **Versi Dokumen:** 1.0
> **Tanggal:** 2026-10-08
> **Status:** Draft
> **Sumber Acuan:** Proposal Project Work — SIMESA SMK Penerbangan Dirghantara

---

## 1. Ringkasan Eksekutif

**SIMESA** (Sistem Informasi Manajemen Elektronik Sekolah dan Administrasi) adalah platform web terpadu yang dirancang khusus untuk SMK Penerbangan Dirghantara guna mendigitalisasi seluruh proses tata kelola administrasi sekolah. Sistem ini menggantikan proses manual pada pencatatan kehadiran, pengolahan nilai, penilaian siswa berprestasi, serta distribusi informasi sekolah — dengan solusi berbasis web yang terintegrasi, akuntabel, dan real-time.

### Permasalahan yang Diselesaikan

| No | Masalah Eksisting | Dampak |
|----|-------------------|--------|
| 1 | Presensi guru dilakukan secara konvensional, tanpa validasi lokasi | Manipulasi kehadiran, rekapitulasi lambat |
| 2 | Presensi siswa dicatat di buku jurnal manual per kelas | Sulit monitoring dini, rekap lambat |
| 3 | Pengolahan nilai dilakukan terpisah dan manual | Beban administratif guru, lambat terbit |
| 4 | Penilaian siswa berprestasi melalui musyawarah tanpa instrumen baku | Tidak objektif, proses panjang |
| 5 | Pencatatan pelanggaran BK tidak terintegrasi dengan evaluasi prestasi | Penilaian kedisiplinan tidak otomatis |
| 6 | Mading fisik sebagai sarana informasi utama | Informasi tidak tersampaikan tepat waktu |
| 7 | Orang tua tidak dapat memantau kehadiran anak secara langsung | Keterlambatan tindakan ketika terjadi alpa |

---

## 2. Tujuan Produk

1. **Modernisasi Presensi Guru** — Presensi mandiri berbasis biometrik wajah (Face Recognition) + validasi geolokasi GPS.
2. **Digitalisasi Presensi Siswa** — Pencatatan per kelas dengan filter bulanan/semester dan ekspor Excel (.xlsx).
3. **SPK Siswa Berprestasi** — Implementasi algoritma SMART (Simple Multi-Attribute Rating Technique) 5 kriteria terbobot.
4. **Manajemen Nilai Akademik & E-Rapor** — Pengolahan nilai, ekspor Excel, dan penerbitan e-rapor PDF siap cetak.
5. **Buku Saku Digital Kedisiplinan** — Pencatatan pelanggaran terintegrasi ke SPK SMART dan pemantauan SP.
6. **Mading & Informasi Digital** — Publikasi terpusat pengumuman, agenda, dan kalender akademik.
7. **LMS & Evaluasi Pembelajaran** — Distribusi materi, pengelolaan tugas, dan kuesioner evaluasi KBM.
8. **Portal Orang Tua + WA Gateway** — Pemantauan kehadiran dan notifikasi otomatis via Bot WhatsApp.
9. **Audit Trail & Dashboard Eksekutif** — Log perubahan data dan dasbor monitoring untuk kepala sekolah.

---

## 3. Pengguna Sistem (User Roles)

SIMESA mendukung **12 peran fungsional** dengan Role-Based Access Control (RBAC) dua tingkat administrasi:

| # | Peran | Kode Role | Akses Utama |
|---|-------|-----------|-------------|
| 1 | **Super Admin** | `super_admin` | Akses penuh sistem: konfigurasi SPK, manajemen seluruh akun (guru, siswa, semua peran), pengaturan program keahlian, konfigurasi sistem, audit trail, dan semua fitur admin |
| 2 | Administrator / Staf TU | `admin` | Input dan pengelolaan data operasional harian: data siswa, absensi, jadwal, pengumuman mading — **tanpa** akses konfigurasi sistem, bobot SPK, atau manajemen akun pengguna |
| 3 | Kepala Sekolah | `kepala_sekolah` | Dashboard eksekutif, monitoring menyeluruh (read-only) |
| 4 | Petugas Piket | `petugas_piket` | Papan kontrol presensi guru harian, verifikasi alternatif |
| 5 | Dewan Guru / Guru Mapel | `guru` | Presensi mandiri biometrik, input absen siswa, input nilai, upload LMS |
| 6 | Wali Kelas | `wali_kelas` | Dashboard kelas bimbingan, rekap absensi & nilai, e-rapor |
| 7 | Guru BK / Tim Kesiswaan | `guru_bk` | Buku saku pelanggaran, riwayat konseling, integrasi SPK |
| 8 | Pembina Ekstrakurikuler | `pembina_ekskul` | Data keanggotaan ekskul, keaktifan, input prestasi (C4, C5 SPK) |
| 9 | Pustakawan | `pustakawan` | Katalog buku, transaksi sirkulasi peminjaman/pengembalian |
| 10 | Pengelola Sarpras | `sarpras` | Informasi fasilitas lab/hanggar, jadwal pemakaian |
| 11 | Siswa & Orang Tua / Wali | `siswa` | Materi LMS, pengumuman, rekap nilai & kehadiran, kuesioner evaluasi; **satu akun siswa juga digunakan orang tua** untuk memantau kehadiran anak dan menerima notifikasi WA |

### Catatan Desain Akun Siswa & Orang Tua

Akun siswa (`siswa`) berfungsi **ganda** sebagai akun orang tua. Nomor WhatsApp orang tua disimpan di profil siswa. Setelah login, tampilan portal orang tua tersedia di tab/section terpisah dalam antarmuka siswa sehingga tidak perlu dua akun berbeda.

### Perbedaan Super Admin vs Admin

| Kemampuan | Super Admin | Admin |
|-----------|:-----------:|:-----:|
| Manajemen akun pengguna (buat/edit/hapus semua role) | ✅ | ❌ |
| Konfigurasi bobot & kriteria SPK SMART | ✅ | ❌ |
| Manajemen program keahlian (AP/EA) | ✅ | ❌ |
| Konfigurasi tahun ajaran & periode aktif | ✅ | ❌ |
| Konfigurasi WA Gateway (token, nomor) | ✅ | ❌ |
| Akses audit trail penuh | ✅ | ❌ |
| Reset password semua pengguna | ✅ | ❌ |
| Input & kelola data siswa | ✅ | ✅ |
| Input & kelola data guru | ✅ | ✅ |
| Kelola kelas & mata pelajaran | ✅ | ✅ |
| Publikasi mading & pengumuman | ✅ | ✅ |
| Rekap data operasional sekolah | ✅ | ✅ |

---

## 4. Fitur Fungsional (16 Modul Sistem)

> **Versi Dokumen diperbarui:** Jumlah role menjadi 12 (ditambah Super Admin). Role `orang_tua` dihapus dan digabung ke role `siswa`. Admin dibatasi akses konfigurasi sistem.

---

### Modul A — Autentikasi, Keamanan & Manajemen Hak Akses (RBAC)

**Deskripsi:** Fondasi keamanan sistem yang mengatur login, enkripsi, dan otorisasi seluruh pengguna.

**User Stories:**
- Sebagai pengguna, saya ingin login dengan email/username dan kata sandi agar dapat mengakses fitur sesuai peran saya.
- Sebagai **super admin**, saya ingin mengelola seluruh akun pengguna (buat, edit, nonaktifkan) untuk semua 12 peran, termasuk konfigurasi sistem dan SPK.
- Sebagai **admin**, saya ingin mengelola data operasional harian (siswa, kelas, mata pelajaran) tanpa mengakses konfigurasi sensitif sistem.
- Sebagai pengguna, saya ingin memperbarui profil dan kata sandi saya secara mandiri.
- Sebagai siswa, saya ingin portal orang tua tersedia di dalam akun saya sehingga orang tua bisa memantau kehadiran tanpa akun terpisah.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| A-01 | Autentikasi sesi terenkripsi dengan hashing kata sandi `bcrypt` | Must Have |
| A-02 | RBAC untuk **12 peran fungsional**; setiap halaman dibatasi sesuai peran | Must Have |
| A-03 | **Super Admin**: kelola seluruh akun pengguna semua role, konfigurasi SPK, program keahlian, WA Gateway, audit trail | Must Have |
| A-04 | **Admin**: kelola data siswa, guru, kelas, mapel, mading — tanpa akses konfigurasi sistem & bobot SPK | Must Have |
| A-05 | Manajemen data master siswa: NIS/NISN, nama, kelas, program keahlian AP/EA, alamat, email, nomor WhatsApp orang tua, ekskul | Must Have |
| A-06 | Manajemen data master pendidik/TK: NIP/NUPTK, nama, mata pelajaran, kontak | Must Have |
| A-07 | Akun `siswa` memiliki tab/section **Portal Orang Tua** untuk memantau kehadiran & menerima notifikasi WA (tanpa akun terpisah) | Must Have |
| A-08 | Fasilitas pembaruan profil mandiri (nama, foto, nomor HP, nomor WA orang tua) | Should Have |
| A-09 | Session timeout dan logout otomatis | Should Have |
| A-10 | Pembatasan halaman berbasis peran (middleware route guard) | Must Have |

**Status Implementasi:**
- [x] Autentikasi via Better Auth
- [x] Tabel `students` dan `teachers` tersedia di schema
- [x] Tabel `classes` dan `subjects` tersedia
- [ ] Role `super_admin` belum tersedia
- [ ] RBAC lengkap untuk 12 peran (saat ini: admin, guru, siswa)
- [ ] Tab Portal Orang Tua dalam akun siswa belum tersedia

---

### Modul B — Presensi siswa Terpadu & Ekspor Laporan Excel

**Deskripsi:** Pencatatan dan rekapitulasi kehadiran siswa per kelas dengan kemampuan ekspor laporan.

**User Stories:**
- Sebagai guru, saya ingin mengisi status kehadiran seluruh siswa dalam satu layar tabel interaktif agar tidak membutuhkan waktu lama.
- Sebagai wali kelas, saya ingin mengunduh rekap absensi kelas saya dalam format Excel untuk keperluan pelaporan.
- Sebagai guru BK, saya ingin melihat siswa mana yang sering alfa agar bisa segera ditindaklanjuti.
- Sebagai siswa (atau orang tua via tab Portal Orang Tua), saya ingin melihat riwayat kehadiran harian anak saya per hari, bulan, dan semester.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| B-01 | Tampilan tabel presensi per kelas — semua siswa dalam satu layar | Must Have |
| B-02 | Status kehadiran: Hadir, Izin, Sakit, Alfa | Must Have |
| B-03 | Opsi pengisian massal (tandai semua Hadir lalu ubah pengecualian) | Should Have |
| B-04 | Rekapitulasi otomatis: filter bulanan dan filter satu semester penuh | Must Have |
| B-05 | Ekspor laporan rekap absensi ke format Excel (.xlsx) siap cetak | Must Have |
| B-06 | Pencatatan: tanggal, mata pelajaran, status, guru pencatat, periode | Must Have |
| B-07 | Integrasi data absensi ke kriteria C1 (Kehadiran 30%) pada SPK SMART | Must Have |

**Status Implementasi:**
- [x] Tabel `attendance` tersedia (studentId, tanggal, status, recordedBy, periode)
- [x] Filter periode per semester tersedia
- [ ] Fitur ekspor Excel (.xlsx) belum tersedia
- [ ] Opsi pengisian massal belum tersedia

---

### Modul C — Presensi Guru Berbasis Biometrik Wajah & Validasi Geolokasi

**Deskripsi:** Sistem presensi mandiri guru menggunakan teknologi pengenalan wajah melalui kamera web, divalidasi oleh posisi GPS perangkat.

**User Stories:**
- Sebagai guru, saya ingin melakukan absen secara mandiri menggunakan wajah saya melalui kamera laptop/HP agar tidak perlu antri atau mengisi manual.
- Sebagai petugas piket, saya ingin memantau papan kontrol kehadiran guru secara real-time agar dapat melaporkan ketidakhadiran.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| C-01 | Akses kamera via WebRTC API; deteksi wajah menggunakan face-api.js | Must Have |
| C-02 | Wajah guru terdaftar dicocokkan real-time saat presensi | Must Have |
| C-03 | Validasi geolokasi GPS — presensi hanya valid dalam radius koordinat sekolah | Must Have |
| C-04 | Timestamp presisi; indikator otomatis Tepat Waktu / Terlambat | Must Have |
| C-05 | Papan kontrol harian petugas piket — status kehadiran semua guru real-time | Should Have |
| C-06 | Verifikasi manual alternatif oleh petugas piket untuk kondisi khusus | Should Have |
| C-07 | Log presensi guru tersimpan per hari dengan catatan metode presensi | Must Have |

**Status Implementasi:**
- [ ] Seluruh fitur Modul C belum diimplementasikan (fase 5 pengembangan)

---

### Modul D — Pengolahan Nilai Akademik, E-Rapor Digital & Ekspor Excel

**Deskripsi:** Manajemen nilai akademik terstruktur mencakup komponen nilai, penerbitan rapor digital PDF, dan ekspor ke Excel.

**User Stories:**
- Sebagai guru, saya ingin menginput nilai tugas, ulangan harian, dan praktikum dalam satu antarmuka per mata pelajaran.
- Sebagai wali kelas, saya ingin mengunduh e-rapor seluruh siswa kelas saya dalam format PDF resmi.
- Sebagai siswa, saya ingin melihat nilai saya pada portal agar tahu capaian akademik saya.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| D-01 | Input nilai per komponen: Tugas, Ulangan Harian, Praktikum bengkel aviasi | Must Have |
| D-02 | Konfigurasi bobot formula nilai proporsional per mata pelajaran (umum & kejuruan AP/EA) | Must Have |
| D-03 | Ekspor rekap nilai per kelas ke Excel (.xlsx) | Must Have |
| D-04 | Penerbitan e-rapor digital PDF berkop surat resmi SMK Penerbangan Dirghantara | Must Have |
| D-05 | Rekap capaian akademik sebagai bahan rapat pleno kenaikan kelas | Should Have |
| D-06 | Integrasi nilai rata-rata ke kriteria C2 (Akademik 25%) pada SPK SMART | Must Have |
| D-07 | Kategori nilai dinamis per mapel/kriteria yang dapat dikonfigurasi admin | Should Have |

**Status Implementasi:**
- [x] Tabel `spkScores` dan `spkGradingCategories` tersedia untuk manajemen nilai
- [x] Tabel `subjects` tersedia
- [ ] Input nilai per komponen belum tersedia sebagai modul terpisah
- [ ] Ekspor Excel nilai belum tersedia
- [ ] E-rapor PDF belum tersedia

---

### Modul E — SPK Penentuan Siswa Berprestasi Metode SMART

**Deskripsi:** Sistem Pendukung Keputusan berbasis algoritma SMART untuk menentukan peringkat siswa berprestasi secara objektif dan transparan.

**Algoritma & Bobot Kriteria:**

| Kode | Kriteria | Bobot | Sumber Data | Tipe |
|------|----------|-------|-------------|------|
| C1 | Kehadiran / Presensi | 30% | Modul B (otomatis) | Otomatis |
| C2 | Nilai Rapor / Akademik | 25% | Modul D (otomatis) | Otomatis |
| C3 | Kedisiplinan / Poin BK | 20% | Modul F (otomatis) | Otomatis |
| C4 | Keaktifan Ekstrakurikuler | 15% | Input Pembina Ekskul | Manual |
| C5 | Prestasi & Perlombaan | 10% | Input Pembina Ekskul | Manual |

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| E-01 | Algoritma SMART dengan 5 kriteria terbobot baku seperti tabel di atas | Must Have |
| E-02 | Perankingan per kelas maupun peringkat umum sekolah | Must Have |
| E-03 | Publikasi hasil perankingan yang dapat diaktifkan/dinonaktifkan oleh **super admin** | Must Have |
| E-04 | Konfigurasi bobot & kriteria SPK hanya dapat diubah oleh **super admin** | Must Have |
| E-05 | Cetak Piagam Penghargaan format PDF resmi untuk siswa berprestasi | Should Have |
| E-06 | Arsip historis leaderboard per periode semester | Should Have |
| E-07 | Validasi: total bobot semua kriteria = 100% | Must Have |

**Status Implementasi:**
- [x] Tabel `spkCriteria`, `spkScores`, `spkResults`, `spkPublishStatus` tersedia
- [x] Tabel `leaderboardArchives` tersedia untuk arsip historis
- [x] Algoritma SMART sudah tersedia sebagian
- [ ] Cetak Piagam PDF belum tersedia
- [ ] Input manual C4 & C5 oleh Pembina Ekskul belum tersedia

---

### Modul F — Buku Saku Digital Kedisiplinan siswa

**Deskripsi:** Sistem pencatatan pelanggaran tata tertib siswa berbasis buku saku digital dengan poin akumulasi, terintegrasi ke SPK SMART.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| F-01 | Pencatatan pelanggaran dengan kategori: Ringan, Sedang, Berat | Must Have |
| F-02 | Sistem poin akumulasi sesuai pedoman kedisiplinan sekolah | Must Have |
| F-03 | Integrasi otomatis ke C3 SPK SMART — poin pelanggaran mengurangi skor kedisiplinan | Must Have |
| F-04 | Pemantauan ambang batas poin untuk penerbitan SP 1, SP 2, SP 3 | Must Have |
| F-05 | Notifikasi/alert ketika siswa mendekati ambang Surat Peringatan | Should Have |
| F-06 | Dokumentasi tindakan pembinaan per kasus pelanggaran | Should Have |
| F-07 | Riwayat pelanggaran per siswa (dapat dilihat wali kelas dan kepala sekolah) | Must Have |

**Status Implementasi:**
- [ ] Seluruh Modul F belum diimplementasikan

---

### Modul G — Mading & Pengumuman Sekolah Digital

**Deskripsi:** Platform informasi digital terpusat yang menggantikan papan mading fisik sekolah.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| G-01 | Publikasi: agenda sekolah, jadwal apel kedirgantaraan, surat edaran resmi, kalender akademik | Must Have |
| G-02 | Informasi prestasi siswa-siswi kepada seluruh warga sekolah | Should Have |
| G-03 | Kontrol publikasi: bisa diatur kapan mulai dan berakhir ditampilkan | Should Have |
| G-04 | Tersedia untuk semua pengguna (tanpa perlu role khusus untuk membaca) | Must Have |

**Status Implementasi:**
- [ ] Modul G belum diimplementasikan

---

### Modul H — Perpustakaan Digital Sekolah

**Deskripsi:** Sistem manajemen katalog dan sirkulasi buku koleksi perpustakaan kejuruan kedirgantaraan.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| H-01 | Katalogisasi koleksi: buku pelajaran kejuruan AP/EA, modul umum, referensi aviasi | Must Have |
| H-02 | Pencatatan transaksi: peminjaman dan pengembalian buku | Must Have |
| H-03 | Pemantauan ketersediaan koleksi (stok tersedia / dipinjam) | Must Have |
| H-04 | TIDAK TERMASUK: sistem bebas pustaka kelulusan | Out of Scope |
| H-05 | TIDAK TERMASUK: sistem pembayaran denda keterlambatan | Out of Scope |

**Status Implementasi:**
- [ ] Modul H belum diimplementasikan

---

### Modul I — Informasi Sarana & Fasilitas Laboratorium/Bengkel Praktik

**Deskripsi:** Portal informasi fasilitas praktikum aviasi, termasuk jadwal pemakaian dan SOP keselamatan.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| I-01 | Profil fasilitas: lab komputer, hanggar pesawat, bengkel AP, bengkel Electrical Avionic | Must Have |
| I-02 | Jadwal pemakaian sarana praktikum per fasilitas | Must Have |
| I-03 | Publikasi SOP keselamatan kerja dan tata tertib bengkel penerbangan | Should Have |

**Status Implementasi:**
- [ ] Modul I belum diimplementasikan

---

### Modul J — Pembelajaran Daring (Learning Management System / LMS)

**Deskripsi:** Platform distribusi materi, pengelolaan tugas, dan jadwal pembelajaran untuk mendukung KBM digital.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| J-01 | Distribusi materi digital: modul PDF, bahan tayang (PPT), tautan referensi | Must Have |
| J-02 | Pengelolaan pengumpulan tugas siswa terstruktur dengan tenggat waktu | Must Have |
| J-03 | Jadwal pembelajaran per kelas (opsional, fitur pendukung) | Nice to Have |

**Status Implementasi:**
- [ ] Modul J belum diimplementasikan

---

### Modul K — Kuesioner Evaluasi Pembelajaran Guru

**Deskripsi:** Instrumen evaluasi proses belajar mengajar oleh siswa di akhir semester, dengan output laporan cetak resmi.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| K-01 | Instrumen kuesioner evaluasi KBM yang diisi siswa setiap akhir semester | Must Have |
| K-02 | Rekapitulasi umpan balik siswa dalam laporan analitik sistem | Must Have |
| K-03 | Ekspor laporan evaluasi sebagai dokumen cetak resmi evaluasi kinerja mengajar | Should Have |

**Status Implementasi:**
- [ ] Modul K belum diimplementasikan

---

### Modul L — Bimbingan Konseling & Layanan Kesiswaan

**Deskripsi:** Sistem pencatatan riwayat konseling dan perkembangan kepribadian siswa yang aman dan terjaga kerahasiaannya.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| L-01 | Pencatatan rekam jejak bimbingan konseling per siswa oleh guru BK | Must Have |
| L-02 | Dokumentasi tindak lanjut penanganan masalah kesiswaan | Must Have |
| L-03 | Data konseling HANYA dapat diakses oleh guru BK yang bersangkutan (kerahasiaan) | Must Have |
| L-04 | Pencatatan perkembangan kepribadian siswa | Should Have |

**Status Implementasi:**
- [ ] Modul L belum diimplementasikan

---

### Modul M — Portal Pemantauan Kehadiran Orang Tua (via Akun Siswa)

**Deskripsi:** Tab/section khusus Portal Orang Tua yang terintegrasi dalam akun siswa, memungkinkan orang tua memantau kehadiran harian putra-putrinya tanpa perlu akun terpisah.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| M-01 | Tab **Portal Orang Tua** tersedia di dalam antarmuka akun siswa | Must Have |
| M-02 | Menampilkan rekam jejak kehadiran harian siswa: per hari, per bulan, dan per semester | Must Have |
| M-03 | Akses tab Portal Orang Tua menggunakan **kredensial akun siswa yang sama** (tidak perlu akun terpisah) | Must Have |
| M-04 | Nomor WhatsApp orang tua disimpan di profil siswa dan digunakan untuk notifikasi WA otomatis | Must Have |
| M-05 | Antarmuka responsif dan mobile-friendly | Should Have |
| M-06 | Orang tua dapat melihat ringkasan status kehadiran bulan berjalan secara sekilas | Should Have |

**Status Implementasi:**
- [ ] Tab Portal Orang Tua dalam akun siswa belum diimplementasikan
- [ ] Field nomor WA orang tua di profil siswa perlu ditambahkan ke schema

---

### Modul N — Notifikasi Kehadiran Otomatis via Bot WhatsApp Gateway

**Deskripsi:** Otomasi pengiriman notifikasi rekapitulasi kehadiran harian ke WhatsApp orang tua setiap sore hari.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| N-01 | Pengiriman WA otomatis ke nomor orang tua (dari profil siswa) setiap sore — status: Hadir, Izin, Sakit, Alfa | Must Have |
| N-02 | Pengiriman ringkasan statistik kehadiran harian kepada Kepala Sekolah dan Wali Kelas | Should Have |
| N-03 | Integrasi dengan layanan Bot WhatsApp Gateway (misal: Fonnte, WabotAPI) — dikonfigurasi oleh **super admin** | Must Have |
| N-04 | Jadwal pengiriman terkonfigurasi (cron job sore hari) | Must Have |
| N-05 | Fallback / retry bila pengiriman gagal | Nice to Have |

**Status Implementasi:**
- [ ] Modul N belum diimplementasikan (fase 5 pengembangan)

---

### Modul O — Riwayat Aktivitas Perubahan Data (Audit Trail)

**Deskripsi:** Log sistem yang mencatat setiap perubahan data krusial untuk menjaga integritas dan akuntabilitas.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| O-01 | Log perubahan data krusial: nilai akademik, status kehadiran siswa | Must Have |
| O-02 | Rekam identitas akun pengubah (user ID & nama) | Must Have |
| O-03 | Rekam timestamp perubahan secara presisi | Must Have |
| O-04 | Rekam detail modifikasi: nilai sebelum dan sesudah perubahan | Must Have |
| O-05 | Halaman audit trail dapat diakses oleh admin dan kepala sekolah | Should Have |

**Status Implementasi:**
- [ ] Modul O belum diimplementasikan

---

### Modul P — Dashboard Eksekutif Kepala Sekolah & Monitoring Kelas

**Deskripsi:** Dasbor ringkasan data operasional khusus untuk kepala sekolah dan wali kelas.

**Acceptance Criteria:**

| ID | Kriteria | Prioritas |
|----|----------|-----------|
| P-01 | Dashboard Kepala Sekolah: statistik kehadiran pendidik & siswa | Must Have |
| P-02 | Dashboard Kepala Sekolah: perankingan siswa berprestasi SMART | Must Have |
| P-03 | Dashboard Kepala Sekolah: laporan evaluasi pembelajaran guru | Should Have |
| P-04 | Dashboard Kepala Sekolah: kesehatan data administrasi sekolah | Nice to Have |
| P-05 | Dashboard Wali Kelas: rekap absensi per kelas bimbingan | Must Have |
| P-06 | Dashboard Wali Kelas: rekam poin kedisiplinan siswa | Must Have |
| P-07 | Dashboard Wali Kelas: kelengkapan capaian nilai akademik | Must Have |

**Status Implementasi:**
- [ ] Modul P belum diimplementasikan sebagai dasbor terpisah per peran

---

## 5. Persyaratan Non-Fungsional

| Kategori | Persyaratan | Detail |
|----------|-------------|--------|
| Keamanan | Enkripsi password | bcrypt hashing |
| Keamanan | HTTPS/SSL | Sertifikat SSL pada domain resmi SIMESA |
| Keamanan | Kerahasiaan data BK | Data konseling dibatasi akses hanya Guru BK |
| Performa | Response time | < 3 detik untuk halaman biasa |
| Performa | Face recognition | Deteksi wajah real-time via browser (face-api.js) |
| Kompatibilitas | Responsive design | Mobile-friendly untuk semua role |
| Kompatibilitas | Browser support | Chrome (utama), Firefox, Edge |
| Data | Format ekspor | Excel (.xlsx) dan PDF siap cetak |
| Sistem | Stack teknologi | Next.js, SQLite (Drizzle ORM), Better Auth |
| Infrastruktur | Deployment | Server produksi sekolah + domain resmi |

---

## 6. Arsitektur Teknis (Stack Saat Ini)

```
Frontend  : Next.js (App Router)
Database  : SQLite via Drizzle ORM
Auth      : Better Auth
Styling   : Tailwind CSS + shadcn/ui
Face API  : face-api.js (WebRTC)
Export    : Excel (.xlsx), PDF (e-rapor, piagam)
WA Bot    : WhatsApp Gateway (Fonnte / WabotAPI)
Hosting   : Server Produksi Sekolah + SSL/HTTPS
```

---

## 7. Peta Status Implementasi

| Modul | Nama | Status |
|-------|------|--------|
| A | Autentikasi & RBAC (incl. Super Admin) | Parsial (3 dari 12 peran; super_admin belum ada) |
| B | Presensi Siswa & Ekspor Excel | Parsial (input ada, ekspor belum) |
| C | Presensi Guru Biometrik & Geolokasi | Belum dimulai |
| D | Nilai Akademik, E-Rapor, Ekspor Excel | Parsial (skema ada, UI belum) |
| E | SPK Siswa Berprestasi SMART | Sebagian besar tersedia |
| F | Buku Saku Digital Kedisiplinan | Belum dimulai |
| G | Mading & Pengumuman Digital | Belum dimulai |
| H | Perpustakaan Digital | Belum dimulai |
| I | Informasi Sarpras & Bengkel | Belum dimulai |
| J | LMS Pembelajaran Daring | Belum dimulai |
| K | Kuesioner Evaluasi Guru | Belum dimulai |
| L | Bimbingan Konseling & Kesiswaan | Belum dimulai |
| M | Portal Orang Tua (via akun Siswa) | Belum dimulai |
| N | Notifikasi WA Gateway | Belum dimulai |
| O | Audit Trail (akses Super Admin) | Belum dimulai |
| P | Dashboard Eksekutif | Belum dimulai |

---

## 8. Prioritas Fitur (MoSCoW)

### Must Have — Rilis v1.0

- [ ] A: RBAC lengkap **12 peran** termasuk Super Admin & akun gabungan Siswa+Orang Tua
- [ ] B: Presensi siswa + ekspor Excel
- [ ] C: Presensi guru biometrik + geolokasi
- [ ] D: Nilai akademik + e-rapor PDF + ekspor Excel
- [ ] E: SPK SMART (lengkap dengan C4, C5, piagam PDF; konfigurasi bobot hanya Super Admin)
- [ ] F: Buku saku digital pelanggaran
- [ ] G: Mading & pengumuman digital
- [ ] M: Tab Portal Orang Tua dalam akun siswa
- [ ] N: Notifikasi WA Gateway (konfigurasi token oleh Super Admin)
- [ ] O: Audit Trail (akses Super Admin & Kepala Sekolah)
- [ ] P: Dashboard Kepala Sekolah & Wali Kelas

### Should Have — Rilis v1.1

- [ ] H: Perpustakaan digital
- [ ] I: Informasi sarpras & bengkel
- [ ] J: LMS pembelajaran daring
- [ ] K: Kuesioner evaluasi guru
- [ ] L: Bimbingan konseling digital

### Nice to Have — Rilis v1.2+

- [ ] Jadwal pembelajaran per kelas (LMS)
- [ ] Notifikasi retry WA gateway
- [ ] Dashboard kesehatan administrasi data sekolah

---

## 9. Timeline Pengembangan

| Fase | Periode | Kegiatan |
|------|---------|----------|
| 1 | Bulan I, Minggu 1-2 | Analisis kebutuhan & pengumpulan data master |
| 2 | Bulan I, Minggu 3-4 | Perancangan arsitektur, basis data, UI/UX |
| 3 | Bulan II, Minggu 5-6 | Modul inti: autentikasi, RBAC 12 peran (incl. Super Admin), data master, mading |
| 4 | Bulan II, Minggu 7-8 | Modul akademik: presensi siswa, nilai, e-rapor, SPK SMART, tab Portal Orang Tua |
| 5 | Bulan III, Minggu 9-10 | Integrasi biometrik wajah, geolokasi, WA Gateway |
| 6 | Bulan III, Minggu 11 | Pengujian Black-Box, validasi SMART, fix bug |
| 7 | Bulan III, Minggu 12 | Deployment server produksi, domain, SSL |
| 8 | Bulan IV, Minggu 13-14 | Evaluasi sistem, penyusunan Manual Book |
| 9 | Bulan IV, Minggu 15-16 | Pelatihan pengguna, UAT, serah terima resmi |

---

## 10. Kriteria Keberhasilan (Definition of Done)

| Kriteria | Metode Verifikasi |
|----------|-------------------|
| Semua 16 modul berfungsi sesuai spesifikasi | Black-Box Testing per modul |
| Algoritma SMART menghasilkan nilai yang akurat | Validasi matematis manual vs sistem |
| Biometrik wajah mengenali guru dengan akurasi >= 95% | Pengujian dengan 20+ sampel wajah |
| Geolokasi hanya valid dalam radius sekolah | Pengujian dari dalam dan luar sekolah |
| WA Gateway berhasil kirim ke semua nomor orang tua | Pengujian live dengan 10 akun sampel |
| E-rapor PDF sesuai format resmi sekolah | Verifikasi oleh Waka Kurikulum |
| Semua peran dapat login dan mengakses fitur sesuai hak | UAT bersama dewan guru & staf TU |
| Sistem berjalan stabil di server produksi sekolah | Load testing & monitoring 1 minggu |

---

## 11. Batasan Sistem (Out of Scope)

- Sistem pembayaran denda buku perpustakaan
- Sistem bebas pustaka kelulusan
- Integrasi dengan sistem Dapodik nasional (fase selanjutnya)
- Aplikasi mobile native (Android/iOS)
- Fitur video conference/live streaming pembelajaran
- Sistem pembayaran SPP / administrasi keuangan sekolah

---

## 12. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Kamera/browser tidak mendukung WebRTC | Biometrik tidak berfungsi | Sediakan metode presensi alternatif via piket |
| Geolokasi tidak akurat | Presensi bisa dilakukan dari luar sekolah | Kalibrasi radius + verifikasi petugas piket |
| WA Gateway dibatasi oleh WhatsApp | Notifikasi tidak terkirim | Gunakan provider resmi; tambahkan notifikasi email sebagai backup |
| Data master sekolah tidak lengkap | Sistem tidak dapat digunakan optimal | Fase 1 prioritas pengumpulan data master |
| Resistensi adopsi pengguna | Sistem tidak digunakan maksimal | Pelatihan intensif (Fase 9) + Manual Book |

---

*Dokumen PRD ini disusun berdasarkan Proposal Project Work SIMESA — SMK Penerbangan Dirghantara dan kondisi implementasi aktual pada repositori `absensi-siswa-app` per tanggal 2026-10-08.*

> **Versi 1.1 — 2026-10-08**: "taruna" diganti "siswa", "rombel" diganti "kelas", role `orang_tua` dihapus dan digabung ke `siswa`, ditambahkan role `super_admin`, scope role `admin` disesuaikan.
