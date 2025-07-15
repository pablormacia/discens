'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/utils/supabase/client'

export function CreateCourseDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState('')
  const [levels, setLevels] = useState<unknown[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>('')

  const supabase = createClient()

  useEffect(() => {
    const fetchLevels = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data, error } = await supabase
        .from('profile_school')
        .select('school_id')
        .eq('profile_id', user.id)
        .single()

      const { data: levels } = await supabase
        .from('school_levels')
        .select('id, name')
        .eq('school_id', data.school_id)

      setLevels(levels || [])
    }

    fetchLevels()
  }, [])

  const handleCreate = async () => {
    if (!name || !selectedLevel) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: profileSchool } = await supabase
      .from('profile_school')
      .select('school_id')
      .eq('profile_id', user.id)
      .single()

    await supabase.from('school_courses').insert({
      name,
      school_id: profileSchool.school_id,
      school_level_id: selectedLevel,
    })

    setName('')
    setSelectedLevel('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear curso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nombre del curso</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: 1A, 3°B, Sala Roja" />
          </div>

          <div>
            <Label>Nivel escolar</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCreate}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
