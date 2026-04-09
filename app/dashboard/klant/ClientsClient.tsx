"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AppLayout from "@/components/AppLayout";
import { CalendarDays, FileText, Wrench, ClipboardList } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);

      if (u) {
        supabase
          .from("users")
          .select("rol")
          .eq("id", u.id)
          .single()
          .then(({ data: profile }) => {
            setRol(profile?.rol ?? null);
          });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  };

  if (!user) {
    return <p className="text-center mt-10">Je bent nog niet ingelogd</p>;
  }

  const name =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Gebruiker";

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      {/* header */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
        Welkom, {name}!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Beheer uw afspraken en bekijk de status van uw auto
      </p>

      {/* actie kaarten */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Link href="/dashboard/afspraak">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <CalendarDays className="text-blue-600" />
            </div>
            <h2 className="text-gray-800 dark:text-white font-semibold text-lg mb-2">
              Afspraak Maken
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Plan een nieuwe afspraak voor onderhoud, reparatie of APK keuring
            </p>
          </div>
        </Link>

        <Link href="/dashboard/afspraken">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <div className="bg-green-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <FileText className="text-green-600" />
            </div>
            <h2 className="text-gray-800 dark:text-white font-semibold text-lg mb-2">
              Mijn Afspraken
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Bekijk de status van uw afspraken en facturen
            </p>
          </div>
        </Link>
      </div>

      {/* rol kaarten */}
      {rol === "monteur" && (
        <Link href="/dashboard/mechanic">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition mb-6">
            <div className="bg-purple-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <Wrench className="text-purple-600" />
            </div>
            <h2 className="text-gray-800 dark:text-white font-semibold text-lg mb-2">
              Monteur Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Bekijk uw toegewezen afspraken
            </p>
          </div>
        </Link>
      )}

      {rol === "receptionist" && (
        <Link href="/dashboard/receptionist">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md hover:shadow-lg transition mb-6">
            <div className="bg-orange-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <ClipboardList className="text-orange-600" />
            </div>
            <h2 className="text-gray-800 dark:text-white font-semibold text-lg mb-2">
              Receptionist Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Beheer afspraken en klanten
            </p>
          </div>
        </Link>
      )}

      {/* hoe werkt het */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-md">
        <h2 className="text-gray-800 dark:text-white font-semibold text-lg mb-6">
          Hoe werkt het?
        </h2>

        <div className="grid md:grid-cols-4 gap-6 text-center">
          {[1, 2, 3, 4].map((step) => (
            <div key={step}>
              <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                {step}
              </div>
              <h3 className="text-gray-800 dark:text-white font-bold mb-1">
                Stap {step}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}