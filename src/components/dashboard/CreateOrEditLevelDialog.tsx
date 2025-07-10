'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'

interface Level {
  id?: string
  name: string
  cue?: string
  diegep?: string
  key_prov?: string
  school_id?: string
}

export function CreateOrEditLevelDialog({
  level,
  schoolId, // solo requerido si se está creando
  onClose,
}: {
  level?: Level
  schoolId?: string
  onClose: () => void
}) {
  const supabase = createClient()

  const isEditing = !!level?.id
  const [name, setName] = useState(level?.name || '')
  const [cue, setCue] = useState(level?.cue || '')
  const [diegep, setDiegep] = useState(level?.diegep || '')
  const [keyProv, setKeyProv] = useState(level?.key_prov || '')
  const [loading, setLoading] = useState(false)

  console.log(schoolId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const finalSchoolId = isEditing ? level!.school_id : schoolId
    console.log(schoolId)
    if (!finalSchoolId) {
      alert('Error: school_id no disponible.')
      setLoading(false)
      return
    }

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('school_levels')
          .update({
            name,
            cue,
            diegep,
            key_prov: keyProv,
          })
          .eq('id', level!.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('school_levels').insert({
          name,
          cue,
          diegep,
          key_prov: keyProv,
          school_id: schoolId,
        })

        if (error) throw error
      }

      onClose()
    } catch (error) {
      alert('Error guardando el nivel: ' + JSON.stringify(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar nivel' : 'Nuevo nivel'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nombre del nivel</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <Label>CUE</Label>
            <Input
              value={cue}
              onChange={(e) => setCue(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label>DIEGEP</Label>
            <Input
              value={diegep}
              onChange={(e) => setDiegep(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <Label>Clave provincial</Label>
            <Input
              value={keyProv}
              onChange={(e) => setKeyProv(e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear nivel'}
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
