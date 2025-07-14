// utils/getDashboardRouteForRole.ts

export function getDashboardRouteForRole(roleName: string): string {
  const role = roleName.toLowerCase();

  if (role === "superadmin") return "/dashboard/superadmin";
  if (role === "admin") return "/dashboard/admin";

  const communityRoles = ["familiar", "estudiante"];
  if (communityRoles.includes(role)) return "/dashboard/community";

  const staffRoles = [
    "representante legal",
    "propietario",
    "director general",
    "director de nivel",
    "director de área",
    "preceptor",
    "secretaria",
    "docente",
    "administrativo",
    "maestranza",
  ];
  if (staffRoles.includes(role)) return "/dashboard/staff";

  return "/dashboard/generic";
}
