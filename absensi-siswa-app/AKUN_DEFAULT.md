# 🔑 Kredensial Akun Default SIMESA — SMK Penerbangan Dirghantara

Sistem Informasi Manajemen Elektronik Sekolah dan Administrasi (SIMESA) mendukung **12 Peran Fungsional**. Setelah menjalankan `npx tsx src/db/seed.ts`, Anda dapat masuk menggunakan akun-akun default berikut:

| # | Peran | Username | Password | Nama Pengguna / Jabatan | Dashboard Utama |
|---|-------|----------|----------|--------------------------|-----------------|
| 1 | **Super Admin** | `superadmin01` | `superadmin123` | Dr. Ir. Hendra S., M.T. (Super Admin) | `/admin` (Akses Penuh) |
| 2 | **Staf TU / Admin** | `admin001` | `admin123` | Staf Tata Usaha Sekolah | `/admin` (Operasional) |
| 3 | **Kepala Sekolah** | `kepsek01` | `kepsek123` | Marsma TNI (Purn) Sudirman, M.Pd. | `/admin/eksekutif` |
| 4 | **Petugas Piket** | `piket01` | `piket123` | Serka Agus Suryanto | `/admin/piket` |
| 5 | **Dewan Guru** | `197601012005` | `guru1234` | Budi Santoso, S.Pd., M.T. (Airframe & Powerplant) | `/guru` |
| 6 | **Wali Kelas** | `walikelas01` | `wali123` | Siti Rahayu, M.Pd. (Wali X-AP-1) | `/guru` & `/guru/rapor` |
| 7 | **Guru BK / Kesiswaan** | `gurubk01` | `bk123` | Dra. Retno Wulandari, M.Psi. | `/admin/bk` |
| 8 | **Pembina Ekskul** | `pembina01` | `ekskul123` | Kapten Tek. Bayu Pratama (Aero Modeling) | `/admin/ekskul` |
| 9 | **Pustakawan** | `pustaka01` | `pustaka123` | Endang Sulistyo, S.Ptk. | `/admin/perpustakaan` |
| 10 | **Pengelola Sarpras** | `sarpras01` | `sarpras123` | Mayor Tek. Joko Prabowo (Hanggar) | `/admin/sarpras` |
| 11 | **Siswa & Orang Tua** | `2024001` | `2024001` | Andi Prasetyo (Kelas X-AP-1) | `/siswa` & `/siswa/portal-ortu` |
| 12 | **Siswa & Orang Tua** | `2024002` | `2024002` | Dewi Lestari (Kelas X-AP-1) | `/siswa` & `/siswa/portal-ortu` |

---

### 💡 Catatan Desain
- **Akun Siswa & Orang Tua = 1 Akun Tunggal**: Orang tua login dengan kredensial anak (`2024001`), lalu memantau kehadiran harian & bot WhatsApp pada tab **Portal Orang Tua**.
- **Super Admin vs Admin**: Super Admin memiliki wewenang mengonfigurasi bobot SPK SMART, konfigurasi WA Gateway, audit trail, serta mengelola semua akun peran. Admin TU terbatas pada operasional data master harian.
