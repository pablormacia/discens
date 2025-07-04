// app/api/create-admin/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/adminClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, documentNumber, birthDate, address, phone, schoolId } = body;

    const supabaseAdmin = createAdminClient();

    // 1. Crear usuario en auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    // 2. Crear persona
    const { data: person, error: personError } = await supabaseAdmin
      .from("persons")
      .insert({
        first_name: firstName,
        last_name: lastName,
        document_number: documentNumber,
        birth_date: birthDate,
        address,
        phone,
        type: "staff",
      })
      .select()
      .single();
    if (personError) return NextResponse.json({ error: personError.message }, { status: 400 });

    // 3. Obtener role admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .single();
    if (roleError) return NextResponse.json({ error: roleError.message }, { status: 400 });

    // 4. Crear perfil (usar id del usuario auth)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        user_id: authUser.user.id,
        person_id: person.id,
        role_id: roleData.id,
      })
      .select()
      .single();
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

    // 5. Asignar colegio
    const { error: psError } = await supabaseAdmin
      .from("profile_school")
      .insert({
        profile_id: profile.id,
        school_id: schoolId,
      });
    if (psError) return NextResponse.json({ error: psError.message }, { status: 400 });

    return NextResponse.json({ message: "Usuario creado con éxito" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 },error);
  }
}
