//DashboardProvider.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { setUserContext } from '@/store/slices/userContextSlice'

export default function DashboardProviders({ children }: { children: ReactNode }) {
  

  return <Provider store={store}>{children}</Provider>
}

