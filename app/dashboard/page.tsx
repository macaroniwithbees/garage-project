"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function redirect() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("rol")
        .eq("id", session.user.id)
        .single();

      if (cancelled) return;

      if (!profile) {
        router.replace("/login");
        return;
      }

      if (profile.rol === "admin" || profile.rol === "eigenaar")
        router.replace("/dashboard/admin");
      else router.replace("/dashboard/klant");
    }

    redirect();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <p className="text-center mt-10">Even laden...</p>;
}
