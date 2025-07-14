// app/dashboard/layout.tsx

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { getActiveRoleFromCookies } from "@/lib/getActiveRolFromCookies";

export const metadata = {
  title: "Panel | Discens",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value ?? null,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) throw new Error("No hay usuario autenticado");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "profile_roles(role:roles(name)), persons(first_name, last_name), profile_school(school:schools(name))"
    )
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.profile_roles) {
    console.error("No se pudo determinar los roles del usuario", profileError);
    throw new Error("Roles no definidos para el usuario");
  }

  const { data: rolesData } = await supabase
    .from("profile_roles")
    .select("roles(name)")
    .eq("profile_id", user.id);


  const availableRoles =
    rolesData?.map((r) => r.roles.name).filter(Boolean) || [];

  // Obtener rol activo desde cookie
  const activeRoleCookie = cookieStore.get("activeRole")?.value;

  // Buscar rol activo en los roles del perfil
  const activeRoleObj = profile.profile_roles.find(
    (pr) => pr.role?.name === activeRoleCookie
  );

  // Si no hay rol activo, tomar el primero (fallback)
  const finalRole =
    activeRoleObj?.role?.name || profile.profile_roles[0]?.role?.name;

  if (!finalRole) throw new Error("El usuario no tiene roles asignados");

  const userName = `${profile.persons?.first_name ?? ""} ${
    profile.persons?.last_name ?? ""
  }`;

  const schoolName = profile.profile_school?.[0]?.school?.name ?? "Sin colegio";

  // Definí links según rol
  const superadminLinks = [
    { label: "Inicio", href: "/dashboard/superadmin", icon: "Home" },
    {
      label: "Colegios",
      href: "/dashboard/superadmin/schools",
      icon: "School",
    },
    { label: "Niveles", href: "/dashboard/superadmin/levels", icon: "Layers" },
    { label: "Usuarios", href: "/dashboard/superadmin/users", icon: "Users" },
  ];

  const adminLinks = [
    { label: "Inicio", href: "/dashboard/admin", icon: "Home" },
    { label: "Colegio", href: "/dashboard/admin/school", icon: "School" },
    { label: "Niveles", href: "/dashboard/admin/levels", icon: "Layers" },
    { label: "Usuarios", href: "/dashboard/admin/users", icon: "Users" },
  ];

  const staffLinks = [
    { label: "Inicio", href: "/dashboard/staff", icon: "Home" },
    { label: "Personas", href: "/dashboard/staff/persons", icon: "Users" },
  ];

  const communityLinks = [
    { label: "Inicio", href: "/dashboard/community", icon: "Home" },
    { label: "Mi familia", href: "/dashboard/community/family", icon: "Users" },
  ];

  let links;

switch (finalRole.toLowerCase()){
    case "superadmin":
      links = superadminLinks;
      break;
    case "admin":
      links = adminLinks;
      break;
    case "director de nivel":
    case "propietario":
    case "mantenimiento":
    case "preceptor":
    case "secretaria":
    case "representante legal":
    case "director general":
    case "director de área":
    case "docente":
    case "administrativo":
    case "maestranza":
      links = staffLinks;
      break;
    case "familiar":
    case "estudiante":
      links = communityLinks;
      break;
    default:
      links = [];
      break;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Topbar
          userName={userName}
          schoolName={schoolName}
          role={finalRole}
          availableRoles={availableRoles}
        />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
