"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

interface School {
  id: string;
  name: string;
}

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
      id: string; // person id
    };
    profile_school: { school: School; id?: string }[];
  };
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  address: string;
  phone: string;
  schoolId: string;
}

export function EditAdminDialog({ profile, onClose }: EditAdminDialogProps) {
  const supabase = createClient();
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

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

  useEffect(() => {
    // Cargar datos iniciales al formulario
    reset({
      firstName: profile.person.first_name,
      lastName: profile.person.last_name,
      documentNumber: profile.person.document_number,
      birthDate: profile.person.birth_date || "",
      address: profile.person.address || "",
      phone: profile.person.phone || "",
      schoolId: profile.profile_school.length > 0 ? profile.profile_school[0].school.id : "",
    });
  }, [profile, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      // 1. Actualizar person
      const { error: personError } = await supabase
        .from("persons")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          document_number: data.documentNumber,
          birth_date: data.birthDate,
          address: data.address,
          phone: data.phone,
        })
        .eq("id", profile.person.id);

      if (personError) throw personError;

      // 2. Actualizar profile_school (puede cambiar colegio)
      const currentProfileSchool = profile.profile_school[0];
      if (currentProfileSchool?.school.id !== data.schoolId) {
        // Si cambia colegio: borrar actual y agregar nuevo
        if (currentProfileSchool?.id) {
          await supabase
            .from("profile_school")
            .delete()
            .eq("id", currentProfileSchool.id);
        }
        const { error: psError } = await supabase
          .from("profile_school")
          .insert({
            profile_id: profile.id,
            school_id: data.schoolId,
          });
        if (psError) throw psError;
      }

      onClose();
    } catch (error) {
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              {...register("firstName", { required: "Nombre es obligatorio" })}
              disabled={submitting}
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              {...register("lastName", { required: "Apellido es obligatorio" })}
              disabled={submitting}
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="documentNumber">DNI</Label>
            <Input
              id="documentNumber"
              {...register("documentNumber", { required: "DNI es obligatorio" })}
              disabled={submitting}
            />
            {errors.documentNumber && (
              <p className="text-red-600 text-sm">{errors.documentNumber.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              {...register("birthDate")}
              disabled={submitting}
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" {...register("phone")} disabled={submitting} />
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" {...register("address")} disabled={submitting} />
          </div>

          <div>
            <Label htmlFor="schoolId">Colegio</Label>
            {loadingSchools ? (
              <p>Cargando colegios...</p>
            ) : (
              <Select
                {...register("schoolId", { required: "Debes elegir un colegio" })}
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
              <p className="text-red-600 text-sm">{errors.schoolId.message}</p>
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
