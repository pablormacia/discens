// lib/getActiveRoleFromCookies.ts
import { cookies } from "next/headers"

export function getActiveRoleFromCookies(): string | null {
  const cookieStore = cookies()
  const activeRole = cookieStore.get("activeRole")?.value
  return activeRole ?? null
}