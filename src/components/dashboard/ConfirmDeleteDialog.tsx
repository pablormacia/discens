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

interface ConfirmDeleteDialogProps {
  title?: string
  description?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDeleteDialog({
  title = 'Eliminar elemento',
  description = 'Esta acción no se puede deshacer.',
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    setSubmitting(true)
    await onConfirm()
    setConfirmationText('')
    setSubmitting(false)
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        <div>
          <p className="text-sm mb-2">
            Para confirmar, escribí <strong>eliminar</strong>:
          </p>
          <Input
            placeholder="eliminar"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={submitting}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmationText !== 'eliminar' || submitting}
          >
            {submitting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
