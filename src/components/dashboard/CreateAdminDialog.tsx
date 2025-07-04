"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate: string;
  address: string;
  phone: string;
  schoolId: string;
}

interface School {
  id: string;
  name: string;
  is_active: boolean;
}

interface CreateAdminDialogProps {
  onClose: () => void;
}

export function CreateAdminDialog({ onClose }: CreateAdminDialogProps) {
  const supabase = createClient();
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    control,
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
        .select("id, name, is_active")
        .order("name");

      if (!error && data) setSchools(data);
      setLoadingSchools(false);
    }
    fetchSchools();
  }, [supabase]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error desconocido");

      reset();
      onClose();
    } catch (error: unknown) {
      setServerError(error.message || "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="
          max-w-full
          sm:max-w-4xl
          max-h-[90vh]
          overflow-auto
          flex flex-col sm:flex-row gap-6 p-6
        "
      >
        <DialogHeader>
          <DialogTitle>Crear nuevo administrador</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto max-h-[80vh] space-y-4"
        >
          <div>
            <Label htmlFor="email" className="mb-2">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email es obligatorio" })}
              disabled={submitting}
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="mb-2">Contraseña</Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: "Contraseña es obligatoria" })}
              disabled={submitting}
            />
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          </div>

          <div>
            <Label htmlFor="firstName" className="mb-2">Nombre</Label>
            <Input
              id="firstName"
              {...register("firstName", { required: "Nombre es obligatorio" })}
              disabled={submitting}
            />
            {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}
          </div>

          <div>
            <Label htmlFor="lastName" className="mb-2">Apellido</Label>
            <Input
              id="lastName"
              {...register("lastName", { required: "Apellido es obligatorio" })}
              disabled={submitting}
            />
            {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}
          </div>

          <div>
            <Label htmlFor="documentNumber" className="mb-2">DNI</Label>
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
            <Label htmlFor="birthDate" className="mb-2">Fecha de nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              {...register("birthDate")}
              disabled={submitting}
            />
            {errors.birthDate && (
              <p className="text-red-600 text-sm">{errors.birthDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="mb-2">Teléfono</Label>
            <Input id="phone" {...register("phone")} disabled={submitting} />
          </div>

          <div>
            <Label htmlFor="address" className="mb-2">Dirección</Label>
            <Input id="address" {...register("address")} disabled={submitting} />
          </div>

          <div>
            <Label htmlFor="schoolId" className="mb-2">Colegio asignado</Label>
            {loadingSchools ? (
              <p>Cargando colegios...</p>
            ) : (
              <Controller
                name="schoolId"
                control={control}
                rules={{ required: "Debes elegir un colegio" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un colegio" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem
                          key={school.id}
                          value={school.id}
                          disabled={!school.is_active}
                        >
                          {school.name} {!school.is_active && " (inactivo)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.schoolId && (
              <p className="text-red-600 text-sm">{errors.schoolId.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-red-600 text-sm font-semibold">{serverError}</p>
          )}

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creando..." : "Crear"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                reset();
                onClose();
              }}
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
