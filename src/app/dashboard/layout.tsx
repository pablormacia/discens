// app/dashboard/layout.tsx

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export const metadata = {
  title: "Panel | Discens",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies()

 const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value ?? null,
        set: () => {},
        remove: () => {},
        // Omití getAll para evitar el error, a menos que lo necesites
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) throw new Error("No hay usuario autenticado");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("roles(name), persons(first_name, last_name), profile_school(school:schools(name))")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.roles?.name) {
    console.error("No se pudo determinar el rol del usuario", profileError);
    throw new Error("Rol no definido para el usuario");
  }

  const role = profile.roles.name;
  const userName = `${profile?.persons?.first_name ?? ""} ${
    profile?.persons?.last_name ?? ""
  }`;
const schoolName =
  profile?.profile_school?.[0]?.school?.name ?? "Sin colegio";

  const superadminLinks = [
    { label: "Inicio", href: "/dashboard/superadmin", icon: "Home" },
    { label: "Colegios", href: "/dashboard/superadmin/schools", icon: "School" },
    { label: "Niveles", href: "/dashboard/superadmin/levels", icon: "Layers" },
    { label: "Usuarios", href: "/dashboard/superadmin/users", icon: "Users" },
  ];

  const adminLinks = [
    { label: "Inicio", href: "/dashboard/admin", icon: "Home" },
    { label: "Colegio", href: "/dashboard/admin/school", icon: "School" },
    { label: "Niveles", href: "/dashboard/admin/levels", icon: "Layers" },
    { label: "Usuarios", href: "/dashboard/admin/users", icon: "Users" },
  ];

  const directorLinks = [
    { label: "Inicio", href: "/dashboard/director", icon: "Home" },
    {
      label: "Mis docentes",
      href: "/dashboard/director/teachers",
      icon: "Users",
    },
  ];

  let links

  switch (role) {
  case "superadmin":
    links = superadminLinks;
    break;
  case "admin":
    links = adminLinks;
    break;
  case "director":
    links = directorLinks;
    break;
  default:
    links = []; // o algún fallback
    break;
}

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar links={links} />
      <div className="flex-1 flex flex-col">
        <Topbar userName={userName} schoolName={schoolName} role={role}/>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
