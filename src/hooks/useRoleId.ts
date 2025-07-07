'use client'
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useRoleId(roleName: string) {
  const supabase = createClient();
  const [roleId, setRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoleId() {
      setLoading(true);
      const { data, error } = await supabase
        .from("roles")
        .select("id")
        .eq("name", roleName)
        .single();

      if (error) {
        setError("No se encontró el rol: " + roleName);
        console.error(error);
      } else {
        setRoleId(data.id);
      }

      setLoading(false);
    }

    fetchRoleId();
  }, [roleName]);

  return { roleId, loading, error };
}