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
import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/types/school";

interface Props {
  profile: Profile;
  onClose: () => void;
}

export function EditUserDialog({ profile, onClose }: Props) {
  const [firstName, setFirstName] = useState(profile.person.first_name);
  const [lastName, setLastName] = useState(profile.person.last_name);
  const [documentNumber, setDocumentNumber] = useState(profile.person.document_number);
  const [birthDate, setBirthDate] = useState(profile.person.birth_date || "");
  const [address, setAddress] = useState(profile.person.address || "");
  const [phone, setPhone] = useState(profile.person.phone || "");
  const [schoolName, setSchoolName] = useState(profile.profile_school?.[0]?.school?.name || "-");
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    profile.profile_roles?.map((pr) => pr.role.id) || []
  );

  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("roles")
        .select("id, name")
        .not("name", "in", '("admin", "superadmin")')
        .order("name");

      if (!error && data) setRoles(data);
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const supabase = createClient();

    // Actualizar persona
    const { error: personError } = await supabase.from("persons").update({
      first_name: firstName,
      last_name: lastName,
      document_number: documentNumber,
      birth_date: birthDate || null,
      address,
      phone,
    }).eq("id", profile.person.id);

    // Actualizar roles
    const { error: deleteRolesError } = await supabase
      .from("profile_roles")
      .delete()
      .eq("profile_id", profile.id);

    const { error: insertRolesError } = await supabase
      .from("profile_roles")
      .insert(
        selectedRoleIds.map((role_id) => ({
          profile_id: profile.id,
          role_id,
        }))
      );

    if (personError || deleteRolesError || insertRolesError) {
      setError("Error al actualizar el usuario.");
    } else {
      onClose();
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="py-2">Nombre</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <Label className="py-2">Apellido</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div>
            <Label className="py-2">DNI</Label>
            <Input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="py-2">Fecha de nacimiento</Label>
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div>
              <Label className="py-2">Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="py-2">Dirección</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div>
            <Label className="py-2">Colegio</Label>
            <Input value={schoolName} disabled />
          </div>

          <div>
            <Label className="py-2">Roles</Label>
            <div className="border rounded p-2 space-y-1 max-h-[7.5rem] overflow-y-auto">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoleIds([...selectedRoleIds, role.id]);
                      } else {
                        setSelectedRoleIds(selectedRoleIds.filter((id) => id !== role.id));
                      }
                    }}
                  />
                  <span>{role.name}</span>
                </label>
              ))}
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
