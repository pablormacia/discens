"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, LogOut, Upload } from "lucide-react";
import { logout } from "@/actions/auth/logout";
import { EditProfileDialog } from "@/components/dashboard/EditProfileDialog";
import { getDashboardRouteForRole } from "@/utils/getDashboardRouteForRole";

export function Topbar({
  userName,
  schoolName,
  role, // rol activo
  avatarUrl,
  roleName,
  userId,
  availableRoles = [], // ahora recibe todos los roles disponibles
}: {
  userName: string;
  schoolName: string;
  role: string;
  avatarUrl?: string;
  roleName: string;
  userId: string;
  availableRoles: string[];
}) {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedRole, setSelectedRole] = useState(role);

  useEffect(() => {
    setSelectedRole(role);
  }, [role]);

  const handleRoleChange = (newRole: string) => {
    document.cookie = `activeRole=${encodeURIComponent(
      newRole
    )}; path=/; max-age=3600`;

    const dashboardPath = getDashboardRouteForRole(newRole);

    // Fuerza recarga total de la app para que el layout se regenere
    window.location.href = dashboardPath;
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="w-full px-4 py-3 border-b bg-white flex items-center justify-between">
      <div className="text-sm text-gray-600 flex items-center gap-2">
        Colegio: <span className="font-medium">{schoolName}</span> | Rol:
        {availableRoles.length > 1 ? (
          <Select value={selectedRole} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-[180px] h-8 ml-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="font-medium ml-2">{role}</span>
        )}
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
              onClick={() =>
                alert("Funcionalidad para subir foto no implementada aún")
              }
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
  );
}
