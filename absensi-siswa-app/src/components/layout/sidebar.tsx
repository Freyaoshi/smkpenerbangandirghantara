"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  BookOpen,
  Settings2,
  Database,
  Trophy,
  UserCog,
  ClipboardCheck,
  PenLine,
  BarChart3,
  CalendarCheck,
  LogOut,
  ChevronLeft,
  ChevronDown,
  Megaphone,
  BookMarked,
  Wrench,
  FileText,
  AlertTriangle,
  HeartHandshake,
  Award,
  MessageSquare,
  Laptop,
  Star,
  History,
  TrendingUp,
  Camera,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UserRole } from "@/lib/mock-data";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

export function getRoleLabel(role: UserRole | string): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Administrator";
    case "ADMIN":
      return "Staf TU / Admin";
    case "KEPALA_SEKOLAH":
      return "Kepala Sekolah";
    case "PETUGAS_PIKET":
      return "Petugas Piket";
    case "GURU":
      return "Dewan Guru";
    case "WALI_KELAS":
      return "Wali Kelas";
    case "GURU_BK":
      return "Guru BK / Kesiswaan";
    case "PEMBINA_EKSKUL":
      return "Pembina Ekskul";
    case "PUSTAKAWAN":
      return "Pustakawan";
    case "SARPRAS":
      return "Pengelola Sarpras";
    case "SISWA":
      return "Siswa & Orang Tua";
    default:
      return "Pengguna";
  }
}

function getNavGroupsForRole(role: UserRole | string): NavGroup[] {
  const r = (role || "").toUpperCase();

  if (r === "SUPER_ADMIN") {
    return [
      {
        items: [
          { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ],
      },
      {
        groupLabel: "Data Master",
        items: [
          { label: "Data Siswa", href: "/admin/siswa", icon: Users },
          { label: "Data Guru", href: "/admin/guru", icon: GraduationCap },
          { label: "Data Kelas", href: "/admin/kelas", icon: School },
          { label: "Mata Pelajaran", href: "/admin/mapel", icon: BookOpen },
        ],
      },
      {
        groupLabel: "Operasional Harian",
        items: [
          { label: "Absensi Siswa", href: "/admin/absensi", icon: ClipboardCheck },
          { label: "Input Nilai", href: "/admin/nilai", icon: PenLine },
          { label: "Rekap Kelas", href: "/admin/rekap", icon: BarChart3 },
          { label: "Leaderboard SPK", href: "/admin/leaderboard", icon: Trophy },
          { label: "Mading Sekolah", href: "/admin/mading", icon: Megaphone },
        ],
      },
      {
        groupLabel: "Modul Kejuruan & Layanan",
        items: [
          { label: "Papan Piket Guru", href: "/admin/piket", icon: UserCheck },
          { label: "Buku Saku & BK", href: "/admin/bk", icon: AlertTriangle },
          { label: "Penilaian Ekskul (C4/C5)", href: "/admin/ekskul", icon: Award },
          { label: "Perpustakaan Aviasi", href: "/admin/perpustakaan", icon: BookMarked },
          { label: "Sarpras & Hanggar", href: "/admin/sarpras", icon: Wrench },
          { label: "Dashboard Eksekutif", href: "/admin/eksekutif", icon: TrendingUp },
        ],
      },
      {
        groupLabel: "Sistem & Super Admin",
        items: [
          { label: "Konfigurasi SPK SMART", href: "/admin/spk", icon: Settings2 },
          { label: "Pengaturan & WA Gateway", href: "/admin/system", icon: MessageSquare },
          { label: "Audit Trail", href: "/admin/audit", icon: History },
          { label: "Manajemen Akun (Semua Role)", href: "/admin/akun", icon: UserCog },
          { label: "Manajemen Data", href: "/admin/manajemen-data", icon: Database },
        ],
      },
    ];
  }

  if (r === "ADMIN") {
    return [
      {
        items: [
          { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ],
      },
      {
        groupLabel: "Data Master",
        items: [
          { label: "Data Siswa", href: "/admin/siswa", icon: Users },
          { label: "Data Guru", href: "/admin/guru", icon: GraduationCap },
          { label: "Data Kelas", href: "/admin/kelas", icon: School },
          { label: "Mata Pelajaran", href: "/admin/mapel", icon: BookOpen },
        ],
      },
      {
        groupLabel: "Operasional Harian",
        items: [
          { label: "Absensi Siswa", href: "/admin/absensi", icon: ClipboardCheck },
          { label: "Input Nilai", href: "/admin/nilai", icon: PenLine },
          { label: "Rekap Kelas", href: "/admin/rekap", icon: BarChart3 },
          { label: "Leaderboard SPK", href: "/admin/leaderboard", icon: Trophy },
          { label: "Mading Sekolah", href: "/admin/mading", icon: Megaphone },
        ],
      },
      {
        groupLabel: "Layanan Sekolah",
        items: [
          { label: "Perpustakaan Aviasi", href: "/admin/perpustakaan", icon: BookMarked },
          { label: "Sarpras & Hanggar", href: "/admin/sarpras", icon: Wrench },
        ],
      },
    ];
  }

  if (r === "KEPALA_SEKOLAH") {
    return [
      {
        items: [
          { label: "Dashboard Eksekutif", href: "/admin/eksekutif", icon: TrendingUp },
        ],
      },
      {
        groupLabel: "Monitoring & Laporan",
        items: [
          { label: "Rekap Kehadiran Siswa", href: "/admin/rekap", icon: BarChart3 },
          { label: "Papan Presensi Guru", href: "/admin/piket", icon: UserCheck },
          { label: "Leaderboard Siswa SMART", href: "/admin/leaderboard", icon: Trophy },
          { label: "Buku Saku Siswa", href: "/admin/bk", icon: AlertTriangle },
          { label: "Mading Sekolah", href: "/admin/mading", icon: Megaphone },
          { label: "Audit Trail", href: "/admin/audit", icon: History },
        ],
      },
    ];
  }

  if (r === "PETUGAS_PIKET") {
    return [
      {
        items: [
          { label: "Papan Kontrol Guru", href: "/admin/piket", icon: UserCheck },
        ],
      },
      {
        groupLabel: "Presensi Harian",
        items: [
          { label: "Presensi Siswa", href: "/admin/absensi", icon: ClipboardCheck },
          { label: "Rekap Kehadiran", href: "/admin/rekap", icon: BarChart3 },
          { label: "Mading Sekolah", href: "/admin/mading", icon: Megaphone },
        ],
      },
    ];
  }

  if (r === "GURU_BK") {
    return [
      {
        items: [
          { label: "Buku Saku & Kedisiplinan", href: "/admin/bk", icon: AlertTriangle },
        ],
      },
      {
        groupLabel: "Kesiswaan & Bimbingan",
        items: [
          { label: "Rekap Absensi Siswa", href: "/admin/rekap", icon: BarChart3 },
          { label: "Leaderboard SPK", href: "/admin/leaderboard", icon: Trophy },
          { label: "Mading Sekolah", href: "/admin/mading", icon: Megaphone },
        ],
      },
    ];
  }

  if (r === "PEMBINA_EKSKUL") {
    return [
      {
        items: [
          { label: "Penilaian Ekskul (C4/C5)", href: "/admin/ekskul", icon: Award },
        ],
      },
      {
        groupLabel: "Kegiatan Siswa",
        items: [
          { label: "Leaderboard SPK", href: "/admin/leaderboard", icon: Trophy },
          { label: "Mading Sekolah", href: "/admin/mading", icon: Megaphone },
        ],
      },
    ];
  }

  if (r === "PUSTAKAWAN") {
    return [
      {
        items: [
          { label: "Perpustakaan Digital", href: "/admin/perpustakaan", icon: BookMarked },
        ],
      },
      {
        groupLabel: "Informasi",
        items: [
          { label: "Mading Sekolah", href: "/admin/mading", icon: Megaphone },
        ],
      },
    ];
  }

  if (r === "SARPRAS") {
    return [
      {
        items: [
          { label: "Fasilitas & Hanggar", href: "/admin/sarpras", icon: Wrench },
        ],
      },
      {
        groupLabel: "Informasi",
        items: [
          { label: "Mading Sekolah", href: "/admin/mading", icon: Megaphone },
        ],
      },
    ];
  }

  if (r === "WALI_KELAS") {
    return [
      {
        items: [
          { label: "Dashboard Guru", href: "/guru", icon: LayoutDashboard },
        ],
      },
      {
        groupLabel: "Presensi Mandiri & Siswa",
        items: [
          { label: "Absen Wajah (GPS)", href: "/guru/absensi-mandiri", icon: Camera },
          { label: "Absensi Siswa", href: "/guru/absensi", icon: ClipboardCheck },
          { label: "Rekap Kehadiran", href: "/guru/rekap", icon: BarChart3 },
        ],
      },
      {
        groupLabel: "Bimbingan & Nilai",
        items: [
          { label: "E-Rapor Digital PDF", href: "/guru/rapor", icon: FileText },
          { label: "Input Nilai", href: "/guru/nilai", icon: PenLine },
          { label: "Catatan Pelanggaran", href: "/admin/bk", icon: AlertTriangle },
          { label: "Leaderboard SPK", href: "/guru/leaderboard", icon: Trophy },
          { label: "LMS Pembelajaran", href: "/guru/lms", icon: Laptop },
          { label: "Mading Sekolah", href: "/guru/mading", icon: Megaphone },
        ],
      },
    ];
  }

  if (r === "GURU") {
    return [
      {
        items: [
          { label: "Dashboard Guru", href: "/guru", icon: LayoutDashboard },
        ],
      },
      {
        groupLabel: "Presensi",
        items: [
          { label: "Absen Wajah (GPS)", href: "/guru/absensi-mandiri", icon: Camera },
          { label: "Absensi Siswa", href: "/guru/absensi", icon: ClipboardCheck },
          { label: "Rekap Kehadiran", href: "/guru/rekap", icon: BarChart3 },
        ],
      },
      {
        groupLabel: "KBM & Nilai",
        items: [
          { label: "Input Nilai Siswa", href: "/guru/nilai", icon: PenLine },
          { label: "Leaderboard SPK", href: "/guru/leaderboard", icon: Trophy },
          { label: "LMS Pembelajaran", href: "/guru/lms", icon: Laptop },
          { label: "Mading Sekolah", href: "/guru/mading", icon: Megaphone },
        ],
      },
    ];
  }

  // SISWA & ORANG TUA (1 Akun Terpadu)
  return [
    {
      items: [
        { label: "Dashboard Siswa", href: "/siswa", icon: LayoutDashboard },
      ],
    },
    {
      groupLabel: "Portal Orang Tua (Terpadu)",
      items: [
        { label: "Pantauan Orang Tua", href: "/siswa/portal-ortu", icon: Users, badge: "Ortu" },
      ],
    },
    {
      groupLabel: "Akademik & Presensi",
      items: [
        { label: "Riwayat Absensi", href: "/siswa/absensi", icon: CalendarCheck },
        { label: "Nilai & E-Rapor", href: "/siswa/nilai", icon: ClipboardCheck },
        { label: "Leaderboard Siswa", href: "/siswa/leaderboard", icon: Trophy },
        { label: "LMS Pembelajaran", href: "/siswa/lms", icon: Laptop },
      ],
    },
    {
      groupLabel: "Kedisiplinan & Sekolah",
      items: [
        { label: "Buku Saku Pelanggaran", href: "/siswa/pelanggaran", icon: AlertTriangle },
        { label: "Evaluasi Guru", href: "/siswa/evaluasi", icon: Star },
        { label: "Mading Sekolah", href: "/siswa/mading", icon: Megaphone },
      ],
    },
  ];
}

interface SidebarProps {
  role: UserRole | string;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Data Master": true,
    "Operasional Harian": true,
    "Sistem & Super Admin": true,
    "Modul Kejuruan & Layanan": true,
    "Portal Orang Tua (Terpadu)": true,
    "Akademik & Presensi": true,
    "Kedisiplinan & Sekolah": true,
    "Presensi Mandiri & Siswa": true,
    "Bimbingan & Nilai": true,
    "Presensi": true,
    "KBM & Nilai": true,
    "Monitoring & Laporan": true,
  });

  const navGroups = getNavGroupsForRole(role);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNavItem = (item: NavItem) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/admin" &&
        item.href !== "/guru" &&
        item.href !== "/siswa" &&
        pathname.startsWith(item.href.split("?")[0] + "/"));

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
          collapsed && "justify-center px-2",
          isActive
            ? "bg-amber-500 text-navy-950 font-semibold shadow-md shadow-amber-500/25"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-navy-900" />
        )}
        <item.icon
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-transform duration-200",
            !isActive && "group-hover:scale-110"
          )}
        />
        {!collapsed && (
          <span className="flex-1 truncate">{item.label}</span>
        )}
        {!collapsed && item.badge && (
          <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[264px]"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-2 shadow-md shadow-amber-500/20">
          <Image
            src="/logo.png"
            alt="Logo SMK"
            width={28}
            height={28}
            className="object-contain"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold tracking-tight text-sidebar-foreground">
              SIMESA
            </h1>
            <p className="truncate text-[10px] font-medium text-amber-500">
              SMK Penerbangan Dirghantara
            </p>
          </div>
        )}
      </div>

      {/* Role Badge Indicator */}
      {!collapsed && (
        <div className="border-b border-sidebar-border/60 bg-sidebar-accent/30 px-4 py-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            <span className="truncate text-[11px] font-medium text-sidebar-foreground/80">
              {getRoleLabel(role)}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-4 px-2">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1 mb-2">
              {group.groupLabel && !collapsed ? (
                <>
                  <button
                    onClick={() => toggleGroup(group.groupLabel!)}
                    className="w-full flex items-center justify-between px-3 py-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                  >
                    {group.groupLabel}
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        !openGroups[group.groupLabel!] && "-rotate-90"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "space-y-0.5 overflow-hidden transition-all duration-300",
                      openGroups[group.groupLabel!] ? "max-h-[600px]" : "max-h-0"
                    )}
                  >
                    {group.items.map((item) => renderNavItem(item))}
                  </div>
                </>
              ) : (
                <div className="space-y-0.5">
                  {group.items.map((item) => renderNavItem(item))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer / Logout */}
      <div className="border-t border-sidebar-border p-2">
        <Tooltip>
          <TooltipTrigger render={
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-red-400",
                collapsed && "justify-center px-2"
              )}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="text-xs">Keluar Sistem</span>}
            </Button>
          }>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right">Keluar</TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md transition-colors hover:bg-sidebar-accent"
        aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
      >
        <ChevronLeft
          className={cn(
            "h-3 w-3 transition-transform duration-300",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </aside>
  );
}
