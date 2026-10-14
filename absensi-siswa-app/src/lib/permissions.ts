export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  return role.toUpperCase() === "SUPER_ADMIN";
}

export function isAdminOrSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  const r = role.toUpperCase();
  return r === "SUPER_ADMIN" || r === "ADMIN";
}

export function isTeacherOrAdmin(role?: string | null): boolean {
  if (!role) return false;
  const r = role.toUpperCase();
  return [
    "SUPER_ADMIN",
    "ADMIN",
    "GURU",
    "WALI_KELAS",
    "PETUGAS_PIKET",
    "GURU_BK",
    "PEMBINA_EKSKUL",
  ].includes(r);
}

export function isStaffRole(role?: string | null): boolean {
  if (!role) return false;
  const r = role.toUpperCase();
  return [
    "SUPER_ADMIN",
    "ADMIN",
    "KEPALA_SEKOLAH",
    "PETUGAS_PIKET",
    "GURU",
    "WALI_KELAS",
    "GURU_BK",
    "PEMBINA_EKSKUL",
    "PUSTAKAWAN",
    "SARPRAS",
  ].includes(r);
}

export function isStudent(role?: string | null): boolean {
  if (!role) return false;
  return role.toUpperCase() === "SISWA";
}
