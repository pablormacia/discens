// components/dialogs/create-school-dialog.tsx
'use client'

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SchoolForm } from './SchoolForm'

export function CreateSchoolDialog({ onCreated }: { onCreated: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Agregar colegio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo colegio</DialogTitle>
        </DialogHeader>
        <SchoolForm onSuccess={onCreated} />
      </DialogContent>
    </Dialog>
  )
}
