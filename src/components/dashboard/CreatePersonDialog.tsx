"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPerson } from "@/actions/persons";
import { createClient } from "@/utils/supabase/client";

interface Props {
  onClose: () => void;
}

type Role = { id: string; name: string };
type SchoolLevel = { id: string; name: string };

export function CreatePersonDialog({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Aquí guardamos niveles asignados por rol
  // clave: roleId, valor: array de schoolLevelIds
  const [roleLevelsMap, setRoleLevelsMap] = useState<Record<string, string[]>>(
    {}
  );

  const [schoolLevels, setSchoolLevels] = useState<SchoolLevel[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      // Obtener usuario y colegio
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Obtener colegio del perfil
      const { data: psData, error: psError } = await supabase
        .from("profile_school")
        .select("schools(id, name)")
        .eq("profile_id", user.id)
        .single();

      console.log(psData);

      if (!psError && psData?.schools) {
        setSchoolId(psData.schools.id);
        setSchoolName(psData.schools.name);

        // Cargar niveles escolares del colegio
        const { data: levelsData, error: levelsError } = await supabase
          .from("school_levels")
          .select("id, name")
          .eq("school_id", psData.schools.id)
          .order("name");
        if (!levelsError && levelsData) {
          setSchoolLevels(levelsData);
        }
      }

      // Cargar roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("id, name")
        .order("name");

      const roles = (rolesData ?? []).filter(
        (role) => role.name !== "admin" && role.name !== "superadmin"
      );

      console.log(roles);
      if (!rolesError && roles) {
        setRoles(roles);
      }
    }

    fetchData();
  }, []);

  // Cuando seleccionas o deseleccionas un rol
  const toggleRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
      // También eliminar niveles asignados a ese rol
      const copy = { ...roleLevelsMap };
      delete copy[roleId];
      setRoleLevelsMap(copy);
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
      // Inicializar niveles vacíos para el nuevo rol
      setRoleLevelsMap((prev) => ({ ...prev, [roleId]: [] }));
    }
  };

  // Cuando seleccionas/deseleccionas un nivel para un rol
  const toggleLevelForRole = (roleId: string, levelId: string) => {
    const currentLevels = roleLevelsMap[roleId] || [];
    if (currentLevels.includes(levelId)) {
      setRoleLevelsMap({
        ...roleLevelsMap,
        [roleId]: currentLevels.filter((id) => id !== levelId),
      });
    } else {
      setRoleLevelsMap({
        ...roleLevelsMap,
        [roleId]: [...currentLevels, levelId],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Aquí mandamos role_ids y también la relación con niveles
    const result = await createPerson({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      document_number: documentNumber,
      birth_date: birthDate || null,
      address,
      phone,
      school_id: schoolId,
      role_ids: selectedRoleIds,
      // role_levels es un array con { role_id, school_level_id }
      role_levels: Object.entries(roleLevelsMap).flatMap(([role_id, levels]) =>
        levels.map((school_level_id) => ({
          role_id,
          school_level_id,
          school_id: schoolId,
        }))
      ),
    });

    if ("error" in result) {
      setError(result.error);
    } else {
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto my-6">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email y contraseña */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="py-2">Email</Label>
              <Input
                name="new-email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="py-2">Contraseña</Label>
              <Input
                name="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Nombre y apellido */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="py-2">Nombre</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="py-2">Apellido</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* DNI */}
          <div>
            <Label className="py-2">DNI</Label>
            <Input
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
          </div>

          {/* Fecha nacimiento y teléfono */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="py-2">Fecha de nacimiento</Label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="py-2">Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <Label className="py-2">Dirección</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Colegio */}
          <div>
            <Label className="py-2">Colegio</Label>
            <Input value={schoolName} disabled />
          </div>

          {/* Roles y niveles por rol como tabla */}
          <div>
            <Label className="py-2">Roles y niveles</Label>
            <div className="border rounded p-2 space-y-2">
              {roles.map((role) => {
                const selected = selectedRoleIds.includes(role.id);
                return (
                  <div
                    key={role.id}
                    className="flex items-start justify-between border-b last:border-b-0 py-2"
                  >
                    {/* Columna 1: rol como badge clickeable */}
                    <button
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`text-sm font-semibold rounded-full px-3 py-1 transition-all ${
                        selected
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {role.name}
                    </button>

                    {/* Columna 2: niveles si el rol está seleccionado */}
                    <div className="flex flex-wrap gap-2 max-w-[75%] justify-end">
                      {selected &&
                        schoolLevels.map((level) => {
                          const short = level.name.slice(0, 1).toUpperCase(); // I, P, S
                          const checked =
                            roleLevelsMap[role.id]?.includes(level.id) || false;

                          return (
                            <div key={level.id} className="relative group">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleLevelForRole(role.id, level.id)
                                }
                                className={`text-xs font-semibold border rounded px-2 py-1 transition-all ${
                                  checked
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-white text-gray-800 border-gray-300"
                                }`}
                              >
                                {short}
                              </button>
                              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                                {level.name}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creando..." : "Crear"}
            </Button>
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
