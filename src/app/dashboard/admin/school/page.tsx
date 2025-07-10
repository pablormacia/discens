'use client'

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { EditSchoolDialog } from "@/components/dashboard/EditSchoolDialog"
import type { School } from "@/types/school"

export default function AdminSchoolPage() {
  const supabase = createClient()
  const [school, setSchool] = useState<School | null>(null)

  useEffect(() => {
    async function fetchSchool() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id) return

      const { data, error } = await supabase
        .from("profile_school")
        .select("school:schools(id, name, address, phone)")
        .eq("profile_id", user.id)
        .single()

      if (!error && data?.school) {
        setSchool(data.school)
      }
    }

    fetchSchool()
  }, [supabase])

  if (!school) return <p>Cargando colegio...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mi colegio</h1>

      <div className="border rounded p-4 mb-4">
        <p><strong>Nombre:</strong> {school.name}</p>
        <p><strong>Dirección:</strong> {school.address}</p>
        <p><strong>Teléfono:</strong> {school.phone}</p>
      </div>

      <EditSchoolDialog
        school={school}
        onUpdated={() => {
          // recargar datos tras la edición
          location.reload()
        }}
      />
    </div>
  )
}
