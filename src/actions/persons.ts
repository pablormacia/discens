'use server'

import { createServerSupabaseClient } from '@/utils/supabase/server'

export async function createPerson(formData: FormData) {
  const full_name = formData.get('full_name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const role = formData.get('role') as string
  const school_id = formData.get('school_id') as string

  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from('persons').insert([
    {
      full_name,
      email,
      phone,
      role,
      school_id
    }
  ])

  if (error) {
    console.error(error)
    throw new Error('Error inserting person')
  }
}
