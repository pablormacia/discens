"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { SchoolLevel } from "@/types/school";
import { Edit, Trash2, Plus } from "lucide-react";
import { CreateOrEditLevelDialog } from "@/components/dashboard/CreateOrEditLevelDialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

export default function LevelsPage() {
  const supabase = createClient();
  const [levels, setLevels] = useState<SchoolLevel[]>([]);
  const [schoolId,setSchoolId] = useState<string>("")
  const [loading, setLoading] = useState(true);
  const [editingLevel, setEditingLevel] = useState<SchoolLevel | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deletingLevel, setDeletingLevel] = useState<SchoolLevel | null>(null);

  const fetchLevels = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: schoolData } = await supabase
      .from("profile_school")
      .select("school_id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!schoolData?.school_id) {
      setLevels([]);
      setLoading(false);
      return;
    }

    setSchoolId(schoolData.school_id)

    const { data, error } = await supabase
      .from("school_levels")
      .select("*")
      .eq("school_id", schoolData.school_id);

    if (!error && data) {
      setLevels(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLevels();
  }, []);


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Niveles</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo nivel
        </Button>
      </div>

      {loading ? (
        <p>Cargando niveles...</p>
      ) : levels.length === 0 ? (
        <p>No hay niveles cargados para este colegio.</p>
      ) : (
        <Table>
  <TableHeader>
    <TableRow>
      <TableCell>Nombre</TableCell>
      <TableCell>CUE</TableCell>
      <TableCell>DIEGEP</TableCell>
      <TableCell>Clave prov.</TableCell>
      <TableCell className="text-right">Acciones</TableCell>
    </TableRow>
  </TableHeader>

  <TableBody>
    {levels.map((level) => (
      <TableRow key={level.id}>
        <TableCell>{level.name}</TableCell>
        <TableCell>{level.cue || "-"}</TableCell>
        <TableCell>{level.diegep || "-"}</TableCell>
        <TableCell>{level.key_prov || "-"}</TableCell>
        <TableCell className="text-right space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingLevel(level)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setDeletingLevel(level)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
      )}

      {showCreateDialog && (
        <CreateOrEditLevelDialog
          schoolId={schoolId}
          onClose={() => {
            setShowCreateDialog(false);
            fetchLevels();
          }}
        />
      )}

      {editingLevel && (
        <CreateOrEditLevelDialog
          level={editingLevel}
          onClose={() => {
            setEditingLevel(null);
            fetchLevels();
          }}
        />
      )}

      {deletingLevel && (
        <ConfirmDeleteDialog
          itemName={deletingLevel.name}
          onConfirm={async () => {
            await supabase
              .from("school_levels")
              .delete()
              .eq("id", deletingLevel.id);
            setDeletingLevel(null);
            fetchLevels();
          }}
          onCancel={() => setDeletingLevel(null)}
        />
      )}
    </div>
  );
}
