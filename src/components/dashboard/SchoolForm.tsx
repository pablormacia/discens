// components/forms/SchoolForm.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import type { School } from '@/types/school'
import { dictionary } from '@/utils/functions/dictionary'

export function SchoolForm({
  school,
  onSuccess,
}: {
  school?: School
  onSuccess: () => void
}) {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    name: school?.name ?? '',
    address: school?.address ?? '',
    city: school?.city ?? '',
    province: school?.province ?? '',
    phone: school?.phone ?? '',
    cue: school?.cue ?? '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    if (school) {
      await supabase.from('schools').update({ ...formData }).eq('id', school.id)
    } else {
      await supabase.from('schools').insert({ ...formData })
    }
    setLoading(false)
    onSuccess()
  }

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {['name', 'address', 'city', 'province', 'phone', 'cue'].map((field) => (
        <div key={field}>
          <Label className='mb-2' htmlFor={field}>{dictionary[field] ?? field}</Label>
          <Input
            id={field}
            name={field}
            value={formData[field as keyof typeof formData]}
            onChange={handleChange}
          />
        </div>
      ))}

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </Button>
    </form>
  )
}
