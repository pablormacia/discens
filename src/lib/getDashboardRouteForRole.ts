export function getDashboardRouteForRole(role: string): string {
  const normalized = role.toLowerCase()

  if (normalized === "superadmin") return "/dashboard/superadmin"
  if (normalized === "admin") return "/dashboard/admin"
  if (["familiar", "estudiante"].includes(normalized)) return "/dashboard/community"
  if (
    [
      "representante legal",
      "propietario",
      "director general",
      "director de nivel",
      "director de área",
      "preceptor",
      "secretaria",
      "secretario",
      "docente",
      "administrativo",
      "maestranza",
      "mantenimiento",
    ].includes(normalized)
  ) {
    return "/dashboard/staff"
  }

  return "/dashboard/generic"
}