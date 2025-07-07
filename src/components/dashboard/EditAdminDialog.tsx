"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { School } from "@/types/school";

interface EditAdminDialogProps {
  profile: {
    id: string;
    person: {
      first_name: string;
      last_name: string;
      document_number: string;
      birth_date?: string | null;
      address?: string | null;
      phone?: string | null;
      person_id: string; // person id
    };
    profile_school: { school: School; id?: string }[];
  };
  onClose: () => void;
}

export function EditAdminDialog({ profile, onClose }: EditAdminDialogProps) {
  const supabase = createClient();

  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados para los campos
  const [firstName, setFirstName] = useState(profile.person.first_name);
  const [lastName, setLastName] = useState(profile.person.last_name);
  const [documentNumber, setDocumentNumber] = useState(
    profile.person.document_number
  );
  const [birthDate, setBirthDate] = useState(profile.person.birth_date ?? "");
  const [address, setAddress] = useState(profile.person.address ?? "");
  const [phone, setPhone] = useState(profile.person.phone ?? "");
  const [schoolId, setSchoolId] = useState(
    profile.profile_school.length > 0 ? profile.profile_school[0].school.id : ""
  );

  // Errores simples
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function fetchSchools() {
      setLoadingSchools(true);
      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (!error && data) setSchools(data);
      setLoadingSchools(false);
    }
    fetchSchools();
  }, [supabase]);

  // Validación simple
  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = "Nombre es obligatorio";
    if (!lastName.trim()) newErrors.lastName = "Apellido es obligatorio";
    if (!schoolId) newErrors.schoolId = "Debes elegir un colegio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    console.log("Profile", profile);
    setSubmitting(true);

    try {
      const { error: personError } = await supabase
        .from("persons")
        .update({
          first_name: firstName,
          last_name: lastName,
          document_number: documentNumber || "",
          birth_date: birthDate === "" ? null : birthDate,
          address: address || "",
          phone: phone || "",
        })
        .eq("id", profile.person_id);

      if (personError) throw personError;

      const currentSchoolId = profile.profile_school[0]?.school.id;

      // Si el colegio cambió (o no hay ninguno asignado aún)
      if (currentSchoolId !== schoolId) {
        // Eliminar cualquier asociación previa (por si hay más de una)
        await supabase
          .from("profile_school")
          .delete()
          .eq("profile_id", profile.id);

        // Insertar la nueva asociación
        const { error: psError } = await supabase
          .from("profile_school")
          .insert({
            profile_id: profile.id,
            school_id: schoolId,
          });

        if (psError) throw psError;
      }

      onClose();
    } catch (error) {
      console.error("Error capturado:", error);
      alert("Error actualizando el usuario: " + JSON.stringify(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar administrador</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={submitting}
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm">{errors.firstName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={submitting}
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm">{errors.lastName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="documentNumber">DNI</Label>
            <Input
              id="documentNumber"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              disabled={submitting}
            />
            {errors.documentNumber && (
              <p className="text-red-600 text-sm">{errors.documentNumber}</p>
            )}
          </div>

          <div>
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="schoolId">Colegio</Label>
            {loadingSchools ? (
              <p>Cargando colegios...</p>
            ) : (
              <Select
                value={schoolId}
                onValueChange={setSchoolId}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un colegio" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.schoolId && (
              <p className="text-red-600 text-sm">{errors.schoolId}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onClose()}
              disabled={submitting}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
