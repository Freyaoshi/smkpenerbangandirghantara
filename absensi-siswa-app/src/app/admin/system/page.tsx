"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  MessageSquare,
  MapPin,
  Clock,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  Shield,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SystemSettingsPage() {
  const { data: session } = authClient.useSession();
  const appRole = ((session?.user as Record<string, unknown>)?.appRole as string | undefined)?.toUpperCase();
  const isSuperAdmin = appRole === "SUPER_ADMIN";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWa, setTestingWa] = useState(false);

  const [formData, setFormData] = useState({
    schoolName: "SMK Penerbangan Dirghantara",
    schoolAddress: "Jl. Megantara No. 1, Komplek Bandara Husein Sastranegara, Bandung",
    activeAcademicYear: "2025/2026",
    activeSemester: "Genap",
    waGatewayEnabled: true,
    waGatewayEndpoint: "https://api.fonnte.com/send",
    waGatewayToken: "",
    waGatewaySender: "081234567890",
    schoolLatitude: -6.9175,
    schoolLongitude: 107.6191,
    geofenceRadiusMeters: 150,
    workStartHour: "07:15",
    workEndHour: "15:30",
  });

  const [testResult, setTestResult] = useState<{
    success: boolean;
    total?: number;
    pesan?: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/system/settings");
      if (res.ok) {
        const data = await res.json();
        setFormData({
          schoolName: data.schoolName || "SMK Penerbangan Dirghantara",
          schoolAddress: data.schoolAddress || "",
          activeAcademicYear: data.activeAcademicYear || "2025/2026",
          activeSemester: data.activeSemester || "Genap",
          waGatewayEnabled: data.waGatewayEnabled ?? true,
          waGatewayEndpoint: data.waGatewayEndpoint || "https://api.fonnte.com/send",
          waGatewayToken: data.waGatewayToken || "",
          waGatewaySender: data.waGatewaySender || "081234567890",
          schoolLatitude: data.schoolLatitude ?? -6.9175,
          schoolLongitude: data.schoolLongitude ?? 107.6191,
          geofenceRadiusMeters: data.geofenceRadiusMeters ?? 150,
          workStartHour: data.workStartHour || "07:15",
          workEndHour: data.workEndHour || "15:30",
        });
      }
    } catch {
      toast.error("Gagal memuat pengaturan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast.error("Hanya Super Admin yang berwenang mengubah konfigurasi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/system/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Konfigurasi sistem berhasil disimpan");
      } else {
        const err = await res.json();
        toast.error(err.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerWa = async () => {
    setTestingWa(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/system/wa-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanggal: new Date().toISOString().split("T")[0] }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({
          success: true,
          total: data.totalDiproses,
          pesan: `Berhasil memproses pengiriman notifikasi WhatsApp ke ${data.totalDiproses} nomor orang tua siswa.`,
        });
        toast.success("Notifikasi presensi WA berhasil dikirim!");
      } else {
        setTestResult({ success: false, pesan: data.error || "Gagal mengirim notifikasi" });
        toast.error(data.error || "Gagal mengirim");
      }
    } catch {
      toast.error("Koneksi gagal ke server gateway");
    } finally {
      setTestingWa(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-amber-950 p-6 text-white shadow-xl shadow-navy-950/20">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/20 p-2.5 backdrop-blur-md">
            <Settings className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Konfigurasi Sistem & WhatsApp Gateway
            </h1>
            <p className="text-xs text-navy-200">
              Pengaturan parameter sekolah, integrasi WA Bot notifikasi, dan geolokasi radius presensi
            </p>
          </div>
        </div>

        {!isSuperAdmin && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            <Shield className="h-4 w-4" />
            <span>Mode Baca Saja: Hanya <strong>Super Admin</strong> yang memiliki hak mengubah konfigurasi ini.</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="general">Identitas & Jam</TabsTrigger>
          <TabsTrigger value="wa">WhatsApp Gateway</TabsTrigger>
          <TabsTrigger value="gps">Geolokasi & Hanggar</TabsTrigger>
        </TabsList>

        {/* Tab 1: Identitas & Jam Kerja */}
        <TabsContent value="general">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Identitas Lembaga & Periode Akademik</CardTitle>
              <CardDescription className="text-xs">
                Informasi resmi yang tercetak pada laporan e-rapor, presensi, dan piagam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nama Resmi Sekolah</Label>
                    <Input
                      disabled={!isSuperAdmin}
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Tahun Ajaran Aktif</Label>
                    <Input
                      disabled={!isSuperAdmin}
                      value={formData.activeAcademicYear}
                      onChange={(e) => setFormData({ ...formData, activeAcademicYear: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Alamat Komplek Hanggar / Sekolah</Label>
                  <Textarea
                    disabled={!isSuperAdmin}
                    rows={2}
                    value={formData.schoolAddress}
                    onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Semester Aktif</Label>
                    <Input
                      disabled={!isSuperAdmin}
                      value={formData.activeSemester}
                      onChange={(e) => setFormData({ ...formData, activeSemester: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Batas Presensi Tepat Waktu</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        disabled={!isSuperAdmin}
                        value={formData.workStartHour}
                        onChange={(e) => setFormData({ ...formData, workStartHour: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Jam Pulang Dinas</Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        disabled={!isSuperAdmin}
                        value={formData.workEndHour}
                        onChange={(e) => setFormData({ ...formData, workEndHour: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="bg-navy-700 hover:bg-navy-800 text-white">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Simpan Perubahan
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: WhatsApp Gateway */}
        <TabsContent value="wa">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/60 shadow-md md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Integrasi WhatsApp Gateway Bot</CardTitle>
                    <CardDescription className="text-xs">
                      Mengirimkan rekapitulasi kehadiran siswa harian otomatis ke WhatsApp Orang Tua (Modul N)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="wa-toggle" className="text-xs font-medium">Status Bot</Label>
                    <Switch
                      id="wa-toggle"
                      disabled={!isSuperAdmin}
                      checked={formData.waGatewayEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, waGatewayEnabled: checked })}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">API Endpoint Provider (Fonnte / WabotAPI)</Label>
                    <Input
                      disabled={!isSuperAdmin}
                      value={formData.waGatewayEndpoint}
                      onChange={(e) => setFormData({ ...formData, waGatewayEndpoint: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">API Token / Secret Key</Label>
                      <Input
                        type="password"
                        disabled={!isSuperAdmin}
                        value={formData.waGatewayToken}
                        onChange={(e) => setFormData({ ...formData, waGatewayToken: e.target.value })}
                        placeholder="Masukkan token dari Fonnte..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Nomor WhatsApp Pengirim Sekolah</Label>
                      <Input
                        disabled={!isSuperAdmin}
                        value={formData.waGatewaySender}
                        onChange={(e) => setFormData({ ...formData, waGatewaySender: e.target.value })}
                        placeholder="Contoh: 081234567890"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-3 text-xs text-navy-800">
                    <p className="font-semibold flex items-center gap-1.5 mb-1">
                      <Info className="h-3.5 w-3.5 text-navy-600" /> Format Template Notifikasi Otomatis:
                    </p>
                    <p className="text-muted-foreground whitespace-pre-line font-mono text-[11px] bg-white p-2.5 rounded-lg border">
                      ✈️ *SIMESA — SMK PENERBANGAN DIRGHANTARA*{'\n\n'}
                      Yth. Bapak/Ibu Orang Tua dari *[Nama Siswa]* ([NIS] - [Kelas]){'\n'}
                      Presensi hari ini ([Tanggal]): *[HADIR / IZIN / SAKIT / ALFA]*{'\n'}
                      Pantau perkembangan ananda di portal SIMESA.
                    </p>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={saving} className="bg-navy-700 hover:bg-navy-800 text-white">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Simpan Token WA
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Test Trigger Card */}
            <Card className="border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Simulasi & Pemicu Manual</CardTitle>
                <CardDescription className="text-xs">
                  Kirimkan notifikasi harian hari ini ke seluruh nomor orang tua siswa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Klik tombol di bawah ini untuk memicu pengiriman notifikasi kehadiran secara serentak ke WhatsApp orang tua yang tersimpan di profil siswa.
                </p>

                <Button
                  onClick={handleTriggerWa}
                  disabled={testingWa}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {testingWa ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim Notifikasi...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Kirim Notifikasi Hari Ini
                    </>
                  )}
                </Button>

                {testResult && (
                  <div
                    className={`rounded-xl p-3 text-xs ${
                      testResult.success
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border border-red-200 bg-red-50 text-red-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{testResult.pesan}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Geolokasi & Hanggar */}
        <TabsContent value="gps">
          <Card className="border-border/60 shadow-md">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Koordinat Hanggar Sekolah & Validasi Geolokasi</CardTitle>
              <CardDescription className="text-xs">
                Digunakan untuk validasi jarak saat dewan guru melakukan presensi biometrik wajah (Modul C)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Latitude Titik Hanggar</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      disabled={!isSuperAdmin}
                      value={formData.schoolLatitude}
                      onChange={(e) => setFormData({ ...formData, schoolLatitude: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Longitude Titik Hanggar</Label>
                    <Input
                      type="number"
                      step="0.000001"
                      disabled={!isSuperAdmin}
                      value={formData.schoolLongitude}
                      onChange={(e) => setFormData({ ...formData, schoolLongitude: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Radius Geofence (Meter)</Label>
                    <Input
                      type="number"
                      disabled={!isSuperAdmin}
                      value={formData.geofenceRadiusMeters}
                      onChange={(e) => setFormData({ ...formData, geofenceRadiusMeters: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-900">
                  <div className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4 text-amber-600" />
                    <span>Titik Default Terpasang:</span>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    SMK Penerbangan Dirghantara: ({formData.schoolLatitude}, {formData.schoolLongitude}) dengan radius toleransi <strong>{formData.geofenceRadiusMeters} meter</strong>. Presensi guru di luar radius akan ditandai dengan peringatan jarak.
                  </p>
                </div>

                {isSuperAdmin && (
                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={saving} className="bg-navy-700 hover:bg-navy-800 text-white">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Simpan Pengaturan Geofence
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
