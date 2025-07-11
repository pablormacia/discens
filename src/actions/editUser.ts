"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

const supabase = createServerClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!,
  {
    cookies: {
      getAll: () => cookies().getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: () => {},
    },
  }
);

export async function editUser(formData: {
  user_id: string; // id de perfil (profiles.id)
  first_name: string;
  last_name: string;
  document_number?: string;
  birth_date?: string | null;
  address?: string;
  phone?: string;
  school_id: string;
  role_ids: string[]; // roles nuevos a asignar
  role_levels: {
    role_id: string;
    school_level_id: string;
  }[]; // niveles por rol nuevos a asignar
}) {
  const {
    user_id,
    first_name,
    last_name,
    document_number,
    birth_date,
    address,
    phone,
    school_id,
    role_ids,
    role_levels,
  } = formData;
  console.log("🛠️ formData recibido:", formData);

  if (!user_id) {
    return { error: "user_id es undefined, no se puede continuar." };
  }
  // 1. Actualizar datos personales (persons) vinculado a perfil (profiles.person_id)
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("person_id")
    .eq("id", user_id)
    .single();

  if (profileError || !profileData) {
    return {
      error:
        "Error encontrando perfil:" + profileError?.message ||
        "Perfil no encontrado",
    };
  }

  const person_id = profileData.person_id;

  const { error: personUpdateError } = await supabase
    .from("persons")
    .update({
      first_name,
      last_name,
      document_number,
      birth_date: birth_date || null,
      address,
      phone,
    })
    .eq("id", person_id);

  if (personUpdateError) {
    return {
      error:
        "Error actualizando persona:" + personUpdateError.message ||
        "Error actualizando persona",
    };
  }

  // 2. Actualizar colegio en profile_school (elimino y vuelvo a insertar para simplificar)
  const { error: psDeleteError } = await supabase
    .from("profile_school")
    .delete()
    .eq("profile_id", user_id);

  if (psDeleteError) {
    return {
      error: psDeleteError.message || "Error eliminando colegio actual",
    };
  }

  const { error: psInsertError } = await supabase
    .from("profile_school")
    .insert({
      profile_id: user_id,
      school_id,
    });

  if (psInsertError) {
    return {
      error:
        "Error actualizando colegio:" + psInsertError.message ||
        "Error insertando colegio",
    };
  }

  // 3. Actualizar roles en profile_roles (elimino y vuelvo a insertar)
  const { error: prDeleteError } = await supabase
    .from("profile_roles")
    .delete()
    .eq("profile_id", user_id);

  if (prDeleteError) {
    return {
      error: prDeleteError.message || "Error eliminando roles actuales",
    };
  }

  const roleInserts = role_ids.map((role_id) => ({
    profile_id: user_id,
    role_id,
  }));

  const { error: prInsertError } = await supabase
    .from("profile_roles")
    .insert(roleInserts);

  if (prInsertError) {
    return {
      error:
        "person Insertando roles:" + prInsertError.message ||
        "Error insertando roles",
    };
  }

  // 4. Actualizar niveles por rol en profile_school_levels (elimino y vuelvo a insertar)
  const { error: pslDeleteError } = await supabase
    .from("profile_school_levels")
    .delete()
    .eq("profile_id", user_id);

  if (pslDeleteError) {
    return {
      error: pslDeleteError.message || "Error eliminando niveles actuales",
    };
  }

  if (role_levels.length > 0) {
    const pslInserts = role_levels.map(({ role_id, school_level_id }) => ({
      profile_id: user_id,
      role_id,
      school_level_id,
      school_id,
    }));

    const { error: pslInsertError } = await supabase
      .from("profile_school_levels")
      .insert(pslInserts);

    if (pslInsertError) {
      return {
        error:
          "Error Insertando niveles:" + pslInsertError.message ||
          "Error insertando niveles",
      };
    }
  }

  return { success: true };
}
