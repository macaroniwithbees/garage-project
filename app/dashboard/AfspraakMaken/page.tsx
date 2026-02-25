"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Afspraak from "@/components/DashboardKlant/Afspraak";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabaseClient";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  };

  if (!user) {
    return <p className="text-center mt-10">Je bent nog niet ingelogd</p>;
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar user={user} onLogout={handleLogout} />

      <main className="p-6">
        <div className="mx-auto max-w-4xl">
          <Link href="/dashboard" className="mb-6 inline-block text-blue-600 hover:underline">
            ← Terug naar dashboard
          </Link>
          <Afspraak />
        </div>
      </main>
    </div>
  );
}