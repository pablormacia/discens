"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditProfileDialogProps {
  userId: string
  onClose: () => void
}

export function EditProfileDialog({ userId, onClose }: EditProfileDialogProps) {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [role, setRole] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `roles(name), persons(
            first_name,
            last_name,
            document_number,
            birth_date,
            address,
            phone,
            id
          )`
        )
        .eq("id", userId)
        .single()

      if (error || !data) {
        setError("No se pudo cargar el perfil.")
        return
      }

      setRole(data.roles?.name ?? "")
      const p = data.persons
      setFirstName(p.first_name)
      setLastName(p.last_name)
      setDocumentNumber(p.document_number)
      setBirthDate(p.birth_date ?? "")
      setAddress(p.address ?? "")
      setPhone(p.phone ?? "")
      setLoading(false)
    }

    fetchProfile()
  }, [supabase, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    const { error: updateError } = await supabase
      .from("persons")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
        birth_date: birthDate === "" ? null : birthDate,
      })
      .eq("document_number", documentNumber)

    if (updateError) {
      setError("Error actualizando el perfil.")
    } else {
      onClose()
    }

    setSubmitting(false)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Rol</Label>
              <Input value={role} disabled />
            </div>
            <div>
              <Label>DNI</Label>
              <Input value={documentNumber} disabled />
            </div>
            <div>
              <Label>Nombre</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <Label>Apellido</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <Label>Dirección</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <Label>Fecha de nacimiento</Label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                disabled={submitting}
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
