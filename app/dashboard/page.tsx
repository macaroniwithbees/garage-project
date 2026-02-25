"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="p-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welkom, {user.email}!
        </h1>
        <p className="text-gray-600">Dit is je dashboard.</p>
      </div>
    </div>
  );
}
