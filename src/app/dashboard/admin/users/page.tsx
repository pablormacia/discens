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
import { CreateUserDialog } from "@/components/dashboard/CreateUserDialog";
import { EditUserDialog } from "@/components/dashboard/EditUserDialog";
import { Profile } from "@/types/school";

export default function ManageUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProfile, setEditProfile] = useState<Profile | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        person_id,
        person:persons (
          id,
          first_name,
          last_name,
          email,
          document_number,
          birth_date,
          address,
          phone,
          created_at,
          updated_at
        ),
        profile_school (
          school:schools (
            id,
            name
          )
        ),
        profile_roles (
          role:roles (
            id,
            name
          )
        )
      `
      )
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error("Error al obtener usuarios:", error);
      setLoading(false);
      return;
    }

    const filtered = data.filter((user) => {
      const roleNames = user.profile_roles?.map((pr) => pr.role?.name) || [];
      return !roleNames.includes("admin") && !roleNames.includes("superadmin");
    });

    setUsers(filtered);
    setLoading(false);
  }, [supabase, page]);

  function confirmDelete(profile: Profile) {
    const confirmation = prompt(
      `Escribí "ELIMINAR" para borrar el usuario ${profile.person.first_name} ${profile.person.last_name}`
    );
    if (confirmation === "ELIMINAR") {
      supabase
        .from("profile_school")
        .delete()
        .eq("profile_id", profile.id)
        .then(() =>
          supabase.from("profile_roles").delete().eq("profile_id", profile.id)
        )
        .then(() =>
          supabase
            .from("persons")
            .delete()
            .eq("id", profile.person.id)
            .then(() => fetchUsers())
        );
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de usuarios</h1>
        <Button onClick={() => setShowCreateModal(true)}>Nuevo usuario</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Colegio</TableCell>
              <TableCell className="text-right">Acciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const roles = user.profile_roles?.map((pr) => pr.role.name).join(", ") || "-";
              const schoolName =
                user.profile_school?.[0]?.school?.name || "-";

              return (
                <TableRow key={user.id}>
                  <TableCell>{user.person.first_name}</TableCell>
                  <TableCell>{user.person.last_name}</TableCell>
                  <TableCell>{user.person.email}</TableCell>
                  <TableCell>{roles}</TableCell>
                  <TableCell>{schoolName}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditProfile(user)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => confirmDelete(user)}
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

      {showCreateModal && (
        <CreateUserDialog
          onClose={() => {
            setShowCreateModal(false);
            fetchUsers();
          }}
        />
      )}

      {editProfile && (
        <EditUserDialog
          profile={editProfile}
          onClose={() => {
            setEditProfile(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
