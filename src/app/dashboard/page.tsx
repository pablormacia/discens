import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Database } from "@/types/supabase" // ajustá según tu tipo generado

export default async function DashboardRouter() {
  const supabase = createServerClient<Database>({
    cookies,
  })

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