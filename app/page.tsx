"use client";
import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Car } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-4"><Car className="inline mr-2" size={40} />AutoGarage Pro</h1>

      <LoginForm />
    </main>
  );
}
