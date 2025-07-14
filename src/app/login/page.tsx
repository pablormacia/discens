"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import { getDashboardRouteForRole } from "@/utils/getDashboardRouteForRole";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const supabase = createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      alert(authError?.message || "Error desconocido");
      return;
    }

    const userId = authData.user.id;

    const { data, error } = await supabase
      .from("profiles")
      .select("profile_roles(role:roles(name))")
      .eq("id", userId)
      .single();

    if (error || !data) {
      alert("No se pudo determinar el rol del usuario");
      return;
    }

    const roles = data.profile_roles.map((r: unknown) => r.role.name);

    if (roles.length === 1) {
      localStorage.setItem("activeRole", roles[0]);
      router.push(getDashboardRouteForRole(roles[0]));
    } else {
      router.push("/select-role");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Ingresar a Discens
          </h1>
          <p className="text-gray-500">Gestión escolar</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              className="pl-10"
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              className="pl-10"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleLogin}
          >
            Ingresar
          </Button>
        </div>
      </div>
    </main>
  );
}
