'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Topbar({ userName, schoolName }: { userName: string, schoolName: string }) {
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="w-full px-4 py-3 border-b bg-white flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Colegio: <span className="font-medium">{schoolName}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-700">{userName}</span>
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
