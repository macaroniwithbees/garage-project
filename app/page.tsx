"use client";
import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">AutoGarage Pro</h1>
        <p className="text-gray-700 mb-6">
          Welkom bij AutoGarage Pro! Log in om uw afspraken en reparaties te beheren.
        </p>

        <LoginForm />
      </div>
    </main>
  );
}
