"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { Trash2, Save } from "lucide-react";

export default function SchoolLevelsPage() {
  const supabase = createClient();
  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState("");
  const [levels, setLevels] = useState([]);
  const [newLevel, setNewLevel] = useState({ name: "", cue: "" });
  const [editing, setEditing] = useState({});

  useEffect(() => {
    const fetchSchools = async () => {
      const { data } = await supabase
        .from("schools")
        .select("id, name")
        .order("name");
      if (data) setSchools(data);
    };
    fetchSchools();
  }, [supabase]);

  useEffect(() => {
    if (!schoolId) return;
    const fetchLevels = async () => {
      const { data } = await supabase
        .from("school_levels")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });
      if (data) setLevels(data);
    };
    fetchLevels();
  }, [schoolId, supabase]);

  const handleAddLevel = async () => {
    if (!newLevel.name.trim()) return;
    await supabase
      .from("school_levels")
      .insert({ ...newLevel, school_id: schoolId });
    setNewLevel({ name: "", cue: "" });
    refreshLevels();
  };

  const refreshLevels = async () => {
    const { data } = await supabase
      .from("school_levels")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });
    if (data) setLevels(data);
  };

  const handleEditChange = (id, field, value) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    const changes = editing[id];
    if (!changes) return;
    await supabase.from("school_levels").update(changes).eq("id", id);
    setEditing((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    refreshLevels();
  };

  const handleDelete = async (id) => {
    const confirmDelete = confirm("¿Eliminar este nivel?");
    if (!confirmDelete) return;
    await supabase.from("school_levels").delete().eq("id", id);
    refreshLevels();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Gestión de Niveles por Colegio
      </h1>

      <Label>Colegio</Label>
      <Select onValueChange={(value) => setSchoolId(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccioná un colegio" />
        </SelectTrigger>
        <SelectContent>
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id}>
              {school.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {schoolId && (
        <>
          <div className="mt-6 space-y-2">
            <h2 className="text-xl font-semibold">Agregar nuevo nivel</h2>
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Nombre del nivel"
                value={newLevel.name ?? ""}
                onChange={(e) =>
                  setNewLevel({ ...newLevel, name: e.target.value })
                }
              />

              <Input
                placeholder="CUE"
                value={newLevel.cue ?? ""}
                onChange={(e) =>
                  setNewLevel({ ...newLevel, cue: e.target.value })
                }
              />
            </div>
            <Button className="mt-2" onClick={handleAddLevel}>
              Agregar nivel
            </Button>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Niveles existentes</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>CUE</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell>
                      <Input
                        value={editing[level.id]?.name ?? level.name ?? ""}
                        onChange={(e) =>
                          handleEditChange(level.id, "name", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editing[level.id]?.cue ?? level.cue ?? ""}
                        onChange={(e) =>
                          handleEditChange(level.id, "cue", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSave(level.id)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(level.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
