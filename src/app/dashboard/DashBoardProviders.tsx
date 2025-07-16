'use client'

import { ReactNode, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { setUserContext } from '@/store/slices/userContextSlice'

export default function DashboardProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    const profileId = getCookie('profile_id')
    const schoolId = getCookie('school_id')
    const role = getCookie('activeRole')

    if (profileId && schoolId && role) {
      store.dispatch(setUserContext({ profileId, schoolId, role }))
    }
  }, [])

  return <Provider store={store}>{children}</Provider>
}

// utils/getCookie.ts
export const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}