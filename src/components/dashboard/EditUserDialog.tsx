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
import { editUser } from "@/actions/editUser";
import { createClient } from "@/utils/supabase/client";

interface EditUserDialogProps {
  onClose: () => void;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    document_number: string;
    birth_date: string | null;
    address: string;
    phone: string;
    school_id: string;
    roles: { id: string; name: string }[];
    role_levels: { role_id: string; school_level_id: string }[];
  };
}

type Role = { id: string; name: string };
type SchoolLevel = { id: string; name: string };

export function EditUserDialog({ onClose, user }: EditUserDialogProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [email, setEmail] = useState(user.email);
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [documentNumber, setDocumentNumber] = useState(user.document_number || "");
  const [birthDate, setBirthDate] = useState(user.birth_date ?? "");
  const [address, setAddress] = useState(user.address || "");
  const [phone, setPhone] = useState(user.phone || "");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [schoolId, setSchoolId] = useState(user.school_id);
  const [schoolName, setSchoolName] = useState(""); // Lo cargamos luego

  const [roles, setRoles] = useState<Role[]>([]);
  // Estado para roles seleccionados (solo id)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  // Mapa roleId -> array de niveles asignados (ids)
  const [roleLevelsMap, setRoleLevelsMap] = useState<Record<string, string[]>>({});

  const [schoolLevels, setSchoolLevels] = useState<SchoolLevel[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      // Cargar escuela (nombre)
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .select("name")
        .eq("id", schoolId)
        .single();
      if (!schoolError && schoolData) {
        setSchoolName(schoolData.name);
      }

      // Cargar niveles escolares del colegio
      const { data: levelsData, error: levelsError } = await supabase
        .from("school_levels")
        .select("id, name")
        .eq("school_id", schoolId)
        .order("name");

      if (!levelsError && levelsData) {
        setSchoolLevels(levelsData);
      }

      // Cargar roles disponibles (menos admin y superadmin)
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("id, name")
        .order("name");

      if (!rolesError && rolesData) {
        const filtered = rolesData.filter(
          (r) => r.name !== "admin" && r.name !== "superadmin"
        );
        setRoles(filtered);

        // Precargar roles seleccionados desde user.roles
        setSelectedRoleIds(user.roles.map((r) => r.id));

        // Precargar niveles asignados en el mapa
        const map: Record<string, string[]> = {};
        user.roles.forEach((role) => {
          map[role.id] = user.role_levels
            .filter((rl) => rl.role_id === role.id)
            .map((rl) => rl.school_level_id);
        });
        setRoleLevelsMap(map);
      }
    }

    fetchData();
  }, [schoolId, user.roles, user.role_levels]);

  // Toggle de rol en la lista
  const toggleRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
      // Eliminar niveles para ese rol
      const copy = { ...roleLevelsMap };
      delete copy[roleId];
      setRoleLevelsMap(copy);
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
      // Inicializar niveles vacíos para nuevo rol
      setRoleLevelsMap((prev) => ({ ...prev, [roleId]: [] }));
    }
  };

  // Toggle de nivel para rol
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

  // Submit para actualizar usuario
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError("");

  try {
    const result = await editUser( {
      user_id:user.id,
      first_name: firstName,
      last_name: lastName,
      document_number: documentNumber,
      birth_date: birthDate || null,
      address,
      phone,
      school_id:schoolId,
      // Roles asignados
      role_ids: selectedRoleIds,
      // Relación rol-niveles
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
  } catch (err) {
    console.error("Error inesperado:", err);
    setError("Error inesperado al actualizar usuario.");
  }

  setSubmitting(false);
};

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto my-6">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (deshabilitado) */}
          <div>
            <Label className="py-2">Email</Label>
            <Input value={email} disabled />
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

          {/* Colegio (deshabilitado) */}
          <div>
            <Label className="py-2">Colegio</Label>
            <Input value={schoolName} disabled />
          </div>

          {/* Roles y niveles por rol */}
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
                          const short = level.name.slice(0, 1).toUpperCase();
                          const checked =
                            roleLevelsMap[role.id]?.includes(level.id) || false;

                          return (
                            <div key={level.id} className="relative group">
                              <button
                                type="button"
                                onClick={() => toggleLevelForRole(role.id, level.id)}
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
              {submitting ? "Guardando..." : "Guardar"}
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
