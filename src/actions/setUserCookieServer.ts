'use server'

import { cookies } from 'next/headers'

export async function setUserCookieServer({
  profileId,
  schoolId,
  role,
}: {
  profileId: string
  schoolId: string
  role: string
}) {
  const cookieStore = cookies()

  const options = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 días
  }

  cookieStore.set('profile_id', profileId, options)
  cookieStore.set('school_id', schoolId, options)
  cookieStore.set('active_role', role, options)
}
