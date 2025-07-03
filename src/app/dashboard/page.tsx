// app/dashboard/page.tsx
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Database } from "@/types/supabase"

export default async function DashboardRouter() {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        // los setters NO deben hacer nada acá
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(name)")
    .eq("id", user.id)
    .single()

  const role = profile?.roles?.name

  switch (role) {
    case "superadmin":
      return redirect("/dashboard/superadmin")
    case "admin":
      return redirect("/dashboard/admin")
    case "director":
      return redirect("/dashboard/director")
    case "familiar":
      return redirect("/dashboard/familiar")
    default:
      return redirect("/dashboard/generic")
  }
}






