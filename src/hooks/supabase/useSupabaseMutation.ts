/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useSupabaseMutation.ts
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type MutationFn<T> = (supabase: ReturnType<typeof createClient>, variables: T) => Promise<void>

export function useSupabaseMutation<T>(mutationFn: MutationFn<T>) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [success, setSuccess] = useState(false)

  const mutate = async (variables: T) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await mutationFn(supabase, variables)
      setSuccess(true)
    } catch (err: any) {
      console.error("Mutation error:", err)
      setError(err.message ?? 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return {
    mutate,
    loading,
    error,
    success,
  }
}
