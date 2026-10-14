"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signInError } = await authClient.signIn.username({
        username,
        password,
      });

      if (signInError) {
        setError(signInError.message || "Username atau password salah");
        setLoading(false);
        return;
      }

      // Fetch session to get appRole for routing
      const { data: session } = await authClient.getSession();
      const appRole = ((session?.user as Record<string, unknown>)?.appRole as string | undefined)?.toUpperCase();

      if (appRole === "KEPALA_SEKOLAH") {
        router.push("/admin/eksekutif");
      } else if (appRole === "PETUGAS_PIKET") {
        router.push("/admin/piket");
      } else if (appRole === "GURU_BK") {
        router.push("/admin/bk");
      } else if (appRole === "PEMBINA_EKSKUL") {
        router.push("/admin/ekskul");
      } else if (appRole === "PUSTAKAWAN") {
        router.push("/admin/perpustakaan");
      } else if (appRole === "SARPRAS") {
        router.push("/admin/sarpras");
      } else if (appRole === "SUPER_ADMIN" || appRole === "ADMIN") {
        router.push("/admin");
      } else if (appRole === "GURU" || appRole === "WALI_KELAS") {
        router.push("/guru");
      } else {
        router.push("/siswa");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950" />

      {/* Decorative shapes */}
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-navy-500/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Login Card */}
      <Card className="animate-scale-in relative z-10 w-full max-w-md border-white/10 bg-white/[0.97] shadow-2xl shadow-black/20 backdrop-blur-xl">
        <CardHeader className="items-center pb-2 pt-8">
          {/* Logo */}
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 p-3 shadow-xl shadow-navy-500/30">
            <Image
              src="/logo.png"
              alt="Logo SMK Penerbangan Dirghantara"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-navy-900">
            SIMESA
          </CardTitle>
          <CardDescription className="text-center text-xs font-medium text-muted-foreground">
            Sistem Informasi Manajemen Elektronik Sekolah dan Administrasi
          </CardDescription>
          <p className="mt-1 text-center text-xs font-semibold uppercase tracking-wider text-amber-600">
            SMK Penerbangan Dirghantara
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                NIP / NIS
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan NIP atau NIS"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 border-navy-200 focus-visible:ring-navy-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-navy-200 pr-10 focus-visible:ring-navy-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full bg-navy-500 text-white shadow-lg shadow-navy-500/25 transition-all hover:bg-navy-600 hover:shadow-xl hover:shadow-navy-500/30"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {loading ? "Memproses..." : "Masuk"}
            </Button>
            {/* Quick Demo Login */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
                ⚡ 1-Click Instant Demo Login:
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("superadmin01"); setPassword("superadmin123"); }}
                >
                  👑 Super Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("admin001"); setPassword("admin123"); }}
                >
                  🏢 Admin TU
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("kepsek01"); setPassword("kepsek123"); }}
                >
                  🎖️ Kep. Sekolah
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("piket01"); setPassword("piket123"); }}
                >
                  👮 Petugas Piket
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("197601012005"); setPassword("197601012005"); }}
                >
                  👨‍🏫 Dewan Guru
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("walikelas01"); setPassword("wali123"); }}
                >
                  📋 Wali Kelas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("gurubk01"); setPassword("bk123"); }}
                >
                  🧠 Guru BK
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("pembina01"); setPassword("ekskul123"); }}
                >
                  ✈️ Pembina Ekskul
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("pustaka01"); setPassword("pustaka123"); }}
                >
                  📚 Pustakawan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 justify-start text-[11px] font-normal hover:bg-navy-50 hover:text-navy-700"
                  onClick={() => { setUsername("sarpras01"); setPassword("sarpras123"); }}
                >
                  🛠️ Sarpras Hanggar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 col-span-2 justify-center text-[11px] font-medium bg-amber-50/60 border-amber-200 text-amber-900 hover:bg-amber-100"
                  onClick={() => { setUsername("2024001"); setPassword("2024001"); }}
                >
                  🎓 Siswa & Orang Tua (Andi Prasetyo — X-AP-1)
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
