// utils/supabase/server.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

export const createServerClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: { fetch },
    }
  );
