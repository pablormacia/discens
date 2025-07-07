'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

const supabase = createServerClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!, // IMPORTANTE: usar la service_role
  {
    cookies: {
      getAll: () => cookies().getAll().map(c => ({ name: c.name, value: c.value })),
      setAll: () => {},
    },
  }
);

export async function createAdmin(formData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  document_number?: string;
  birth_date?: string | null;
  address?: string;
  phone?: string;
  school_id: string;
  role_id: string;
}) {
  const {
    email,
    password,
    first_name,
    last_name,
    document_number,
    birth_date,
    address,
    phone,
    school_id,
    role_id,
  } = formData;

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return { error: authError?.message || 'Error creando usuario en Auth.' };
  }

  const userId = authUser.user.id;

  const { data: personData, error: personError } = await supabase
    .from('persons')
    .insert({
      first_name,
      last_name,
      document_number,
      birth_date: birth_date || null,
      address,
      phone,
    })
    .select('id')
    .single();

  if (personError || !personData?.id) {
    return { error: personError?.message || 'Error creando persona.' };
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    person_id: personData.id,
    role_id,
  });

  if (profileError) {
    return { error: profileError.message || 'Error creando perfil.' };
  }

  const { error: psError } = await supabase.from('profile_school').insert({
    profile_id: userId,
    school_id,
  });

  if (psError) {
    return { error: psError.message || 'Error asignando colegio.' };
  }

  return { success: true };
}
