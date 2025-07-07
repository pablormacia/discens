"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit } from "lucide-react";
import { CreateAdminDialog } from "@/components/dashboard/CreateAdminDialog";
import { EditAdminDialog } from "@/components/dashboard/EditAdminDialog";
import { Profile } from "@/types/school";
import { useRoleId } from "@/hooks/useRoleId";

export default function UsersPage() {
  const supabase = createClient();
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProfile, setEditProfile] = useState<Profile | null>(null);


  const { roleId } = useRoleId("admin");


  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        person_id,
        person:persons (
          first_name,
          last_name,
          document_number,
          birth_date,
          address,
          phone,
          created_at,
          updated_at
        ),
        profile_school (
          school:schools (id, name)
        ),
        role:roles (name)
      `
      )
      .eq("role_id", roleId)
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (!error && data) setAdmins(data);
    setLoading(false);
  }, [page, supabase, roleId]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  function confirmDelete(profile: Profile) {
    const confirmation = prompt(
      `Escribí "ELIMINAR" para borrar el usuario ${profile.person.first_name} ${profile.person.last_name}`
    );
    if (confirmation === "ELIMINAR") {
      supabase
        .from("profile_school")
        .delete()
        .eq("profile_id", profile.id)
        .then(() => supabase.from("profiles").delete().eq("id", profile.id))
        .then(() =>
          supabase
            .from("persons")
            .delete()
            .eq("id", profile.person.id)
            .then(() => fetchAdmins())
        );
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <Button onClick={() => setShowCreateModal(true)}>Nuevo Admin</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Colegio</TableCell>
              <TableCell className="text-right">Acciones</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {admins.map((admin) => {
              const schoolName =
                admin.profile_school.length > 0
                  ? admin.profile_school[0].school.name
                  : "-";
              return (
                <TableRow key={admin.id}>
                  <TableCell>{admin.person.first_name}</TableCell>
                  <TableCell>{admin.person.last_name}</TableCell>
                  <TableCell>{admin.person.document_number}</TableCell>
                  <TableCell>{schoolName}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditProfile(admin)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => confirmDelete(admin)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Paginación simple */}
      <div className="mt-4 flex justify-center gap-2">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </Button>
        <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
          Siguiente
        </Button>
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateAdminDialog
          onClose={() => {
            setShowCreateModal(false);
            fetchAdmins();
          }}
        />
      )}

      {editProfile && (
        <EditAdminDialog
          profile={editProfile}
          onClose={() => {
            setEditProfile(null);
            fetchAdmins();
          }}
        />
      )}
    </div>
  );
}
