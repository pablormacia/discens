"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Period = {
  start?: Date;
  end?: Date;
};

export default function CourseYearsPage() {
  const supabase = createClient();

  const [year, setYear] = useState(new Date().getFullYear());
  const [structure, setStructure] = useState<"trimestre" | "cuatrimestre">(
    "trimestre"
  );
  const [periods, setPeriods] = useState<Period[]>([]);
  const [winterStart, setWinterStart] = useState<Date>();
  const [winterEnd, setWinterEnd] = useState<Date>();
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  const [academicYears,setAcademicYears] = useState()
  const [activeYear, setActiveYear] = useState<Date>()

  useEffect(() => {

    const fetchAcademicYears = async ()=>{
      const { data: academicYears,error } = await supabase
      .from("academic_years")
      .select("*");
      if (error){
        console.log("Error al obtener los cliclos lectivos")
      }else{
        console.log(academicYears)
        setAcademicYears(academicYears)
        const {data: activeAcademicYear,error} = await supabase
          .from("academic_years")
          .select("year")
          .eq("is_active",true)
          .single()
          if(!error){
            setActiveYear(activeAcademicYear)
          }
      }
    }
    fetchAcademicYears()
  }, [supabase]);
  
  useEffect(()=>{

  },[supabase])


  // Cambia estructura y reinicia los periodos
  useEffect(() => {
    const count = structure === "trimestre" ? 3 : 2;
    setPeriods(Array(count).fill({}));
    setHasChanges(true);
  }, [structure]);

  const handleDateChange = (
    index: number,
    key: "start" | "end",
    value: Date | undefined
  ) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [key]: value };
    setPeriods(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profileSchool } = await supabase
      .from("profile_school")
      .select("school_id")
      .eq("profile_id", user.id)
      .single();

    const school_id = profileSchool?.school_id;
    if (!school_id) return;

    const { error } = await supabase.from("academic_years").insert({
      school_id,
      year,
      start_date: periods[0]?.start?.toISOString(),
      end_date: periods.at(-1)?.end?.toISOString(),
      winter_break_start: winterStart?.toISOString(),
      winter_break_end: winterEnd?.toISOString(),
      structure,
    });

    if (error) {
      alert("Error al guardar");
      console.error(error);
    } else {
      alert("Ciclo lectivo guardado");
      setHasChanges(false);
    }

    setLoading(false);
  };

  if(academicYears){
    return(
      <div className="p-6">
        <h2>Aún no hay ciclos lectivos creados</h2>
        <Button onClick={()=>{}} disabled={loading}>
        Agregar
      </Button>
      </div>
      
    )
  }else{
    return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Configuración del ciclo lectivo
      </h1>
      {
        
      }

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label>Año</Label>
          <Input
            type="number"
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setHasChanges(true);
            }}
          />
        </div>

        <div>
          <Label>Estructura del ciclo lectivo</Label>
          <Select
            value={structure}
            onValueChange={(v) => setStructure(v as unknown)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estructura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trimestre">Trimestres</SelectItem>
              <SelectItem value="cuatrimestre">Cuatrimestres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        {periods.map((p, index) => (
          <div key={index}>
            <h3 className="font-semibold mb-2">
              {structure === "trimestre"
                ? `Trimestre ${index + 1}`
                : `Cuatrimestre ${index + 1}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Desde</Label>
                <Calendar
                  mode="single"
                  selected={p.start}
                  onSelect={(date) => handleDateChange(index, "start", date)}
                />
              </div>
              <div>
                <Label>Hasta</Label>
                <Calendar
                  mode="single"
                  selected={p.end}
                  onSelect={(date) => handleDateChange(index, "end", date)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label>Receso invernal - Desde</Label>
          <Calendar
            mode="single"
            selected={winterStart}
            onSelect={(date) => {
              setWinterStart(date);
              setHasChanges(true);
            }}
          />
        </div>
        <div>
          <Label>Receso invernal - Hasta</Label>
          <Calendar
            mode="single"
            selected={winterEnd}
            onSelect={(date) => {
              setWinterEnd(date);
              setHasChanges(true);
            }}
          />
        </div>
      </div>

      {hasChanges && (
        <p className="text-yellow-600 font-medium mb-4">Cambios sin guardar</p>
      )}

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Guardando..." : "Guardar ciclo lectivo"}
      </Button>
    </div>
    )
  }

}
