"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check initial session bij pagina load
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listener voor toekomstige sessie veranderingen
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Fout bij uitloggen: " + error.message);
    } else {
      setUser(null);
      router.push("/"); // terug naar home pagina
    }
  };

  if (!user) {
    return <p className="text-center mt-10">Je bent nog niet ingelogd</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-100 via-white to-blue-200">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          Welkom, {user.email}!
        </h1>
        <p className="text-gray-700 mb-6">Dit is je dashboard.</p>

        <button
          onClick={handleLogout}
          className="mt-4 w-full bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition-colors"
        >
          Uitloggen
        </button>
      </div>
    </div>
  );
}
