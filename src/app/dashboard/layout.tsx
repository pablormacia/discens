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
  const cookieStore = await cookies() // Obtener una vez
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
         return cookieStore.get(name)?.value ?? null
        },
        set() {},/* no implementado en Server Components */
        remove() {},/* no implementado en Server Components */
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id;
  if (!userId) throw new Error("No hay usuario autenticado");

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("roles(name), persons(first_name, last_name), schools(name)")
  .eq("id", userId)
  .single()

if (profileError || !profile?.roles?.name) {
  console.error("No se pudo determinar el rol del usuario", profileError)
  throw new Error("Rol no definido para el usuario")
}

const role = profile.roles.name
  const userName = `${profile?.persons?.first_name ?? ""} ${
    profile?.persons?.last_name ?? ""
  }`;
  const schoolName = profile?.schools?.name ?? "Sin colegio";

  const superadminLinks = [
    { label: "Inicio", href: "/dashboard/superadmin", icon: "Home" },
    {
      label: "Colegios",
      href: "/dashboard/superadmin/schools",
      icon: "School",
    },
    { label: "Usuarios", href: "/dashboard/superadmin/users", icon: "Users" },
  ];

  const directorLinks = [
    { label: "Inicio", href: "/dashboard/director", icon: "Home" },
    {
      label: "Mis docentes",
      href: "/dashboard/director/teachers",
      icon: "Users",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar
        links={role === "superadmin" ? superadminLinks : directorLinks}
      />
      <div className="flex-1 flex flex-col">
        <Topbar userName={userName} schoolName={schoolName} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
