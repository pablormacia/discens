'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getDashboardRouteForRole } from "@/utils/getDashboardRouteForRole";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function SelectRolePage() {
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function fetchRoles() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("profile_roles(role:roles(name))")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        router.push("/login");
        return;
      }

      const roleNames = data.profile_roles?.map((pr: unknown) => pr.role.name) || [];
      if (roleNames.length === 1) {
        const onlyRole = roleNames[0];
        localStorage.setItem("activeRole", onlyRole);
        router.push(getDashboardRouteForRole(onlyRole));
        return;
      }

      setRoles(roleNames);
    }

    fetchRoles();
  }, [router]);

  const handleSelect = () => {
    if (selectedRole) {
      localStorage.setItem("activeRole", selectedRole);
      router.push(getDashboardRouteForRole(selectedRole));
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded shadow p-6 space-y-4">
        <h1 className="text-xl font-bold text-center">Seleccionar rol</h1>

        <div className="space-y-2">
          <Label>Rol con el que querés ingresar</Label>
          <Select onValueChange={(value) => setSelectedRole(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná un rol" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          onClick={handleSelect}
          disabled={!selectedRole}
        >
          Continuar
        </Button>
      </div>
    </main>
  );
}
