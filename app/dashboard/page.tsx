"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { routeRoles, AppRoute, Role } from "@/lib/roles";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function redirect() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("rol")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      if (!profile?.rol) {
        router.replace("/login");
        return;
      }

      const role: Role = profile.rol;
      const matchedRoute = (Object.keys(routeRoles) as AppRoute[]).find(
        (route) => routeRoles[route].includes(role)
      );

      router.replace(matchedRoute ?? "/login");
    }

    redirect();
    return () => { cancelled = true; };
  }, [router]);

  return <p className="text-center mt-10">Even laden...</p>;
}