'use client'

import { useState } from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
//import { Button } from "@/components/ui/button"
import { Edit, LogOut, Upload } from "lucide-react"
import { logout } from "@/actions/auth/logout"
import { EditProfileDialog } from "@/components/dashboard/EditProfileDialog" // componente que tendrás que crear

export function Topbar({
  userName,
  schoolName,
  role,
  avatarUrl,
  roleName,
  userId,
}: {
  userName: string
  schoolName: string
  role:string,
  avatarUrl?: string
  roleName: string
  userId: string
}) {
  const [showEditProfile, setShowEditProfile] = useState(false)
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="w-full px-4 py-3 border-b bg-white flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Colegio: <span className="font-medium">{schoolName}</span> | Rol: <span className="font-medium">{role}</span>
      </div>

      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-700">{userName}</span>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Avatar" />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => alert("Funcionalidad para subir foto no implementada aún")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir foto
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setShowEditProfile(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar perfil
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showEditProfile && (
        <EditProfileDialog
          userId={userId}
          roleName={roleName}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </header>
  )
}
