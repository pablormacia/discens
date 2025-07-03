'use client'

import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { SchoolForm } from './SchoolForm'
import type { School } from '@/types/school'

export function EditSchoolDialog({
  school,
  onUpdated,
}: {
  school: School
  onUpdated: () => void
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Editar colegio</DialogTitle>
        <SchoolForm school={school} onSuccess={onUpdated} />
      </DialogContent>
    </Dialog>
  )
}
