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
import { createUser } from "@/actions/createUser";
import { createClient } from "@/utils/supabase/client";

interface Props {
  onClose: () => void;
}

export function CreateUserDialog({ onClose, allowedRoles }: Props) {
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
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    const fetchProfileSchool = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profile_school")
        .select(
          `
      school:schools (
        id,
        name
      )
    `
        )
        .eq("profile_id", user.id)
        .single();

      if (!error && data?.school) {
        setSchoolId(data.school.id);
        setSchoolName(data.school.name);
      }
    };

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from("roles")
        .select("id, name")
        .not("name", "in", '("admin", "superadmin")')
        .order("name");

      if (!error && data) {
        setRoles(data);
      }
    };

    fetchProfileSchool();
    fetchRoles();
  }, [allowedRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await createUser({
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="py-2">Email</Label>
              <Input
                name="new-email" // nombre inventado y poco común
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

          <div>
            <Label className="py-2">DNI</Label>
            <Input
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
          </div>

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

          <div>
            <Label className="py-2">Dirección</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
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
                        setSelectedRoleIds(
                          selectedRoleIds.filter((id) => id !== role.id)
                        );
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
