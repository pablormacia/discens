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
import { Trash2, EyeOff, Eye } from "lucide-react";
import { EditSchoolDialog } from "@/components/dashboard/EditSchoolDialog";
import { CreateSchoolDialog } from "@/components/dashboard/CreateSchoolDialog";
import { School } from "@/types/school";

export default function SchoolsPage() {
  const supabase = createClient();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<"name" | "created_at">("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order(sortField, { ascending: sortAsc })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (!error) setSchools(data || []);
    setLoading(false);
  }, [sortField, sortAsc, page, supabase]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const toggleSort = (field: "name" | "created_at") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  function confirmToggleStatus(school: School) {
    const action = school.is_active ? "desactivar" : "activar";
    const confirmation = confirm(
      `¿Estás seguro que querés ${action} el colegio "${school.name}"?`
    );
    if (confirmation) {
      supabase
        .from("schools")
        .update({ is_active: !school.is_active })
        .eq("id", school.id)
        .then(() => fetchSchools());
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Colegios</h1>
        <CreateSchoolDialog onCreated={fetchSchools} />
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell
                className="cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                Nombre {sortField === "name" ? (sortAsc ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell>Ciudad</TableCell>
              <TableCell>Provincia</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>CUE</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell
                className="cursor-pointer"
                onClick={() => toggleSort("created_at")}
              >
                Creado {sortField === "created_at" ? (sortAsc ? "↑" : "↓") : ""}
              </TableCell>
              <TableCell className="text-right">Acciones</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell>{school.name}</TableCell>
                <TableCell>{school.city}</TableCell>
                <TableCell>{school.province}</TableCell>
                <TableCell>{school.phone}</TableCell>
                <TableCell>{school.cue}</TableCell>
                <TableCell>
                  <span
                    className={
                      school.is_active ? "text-green-600" : "text-gray-500"
                    }
                  >
                    {school.is_active ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(school.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <EditSchoolDialog
                    school={school}
                    onUpdated={fetchSchools}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmToggleStatus(school)}
                  >
                    {school.is_active ? (
                      <EyeOff className="w-4 h-4 text-red-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-green-500" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => confirmDelete(school)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
    </div>
  );

  function confirmDelete(school: School) {
    const confirmation = prompt(
      `Escribí "ELIMINAR" para borrar el colegio "${school.name}"`
    );
    if (confirmation === "ELIMINAR") {
      supabase
        .from("schools")
        .delete()
        .eq("id", school.id)
        .then(() => fetchSchools());
    }
  }
}
