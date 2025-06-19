import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareSupabaseClient } from './src/lib/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareSupabaseClient(req, res)

  // Leemos la sesión (aunque no lo usemos aún)
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
