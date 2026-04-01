"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { CalendarDays, FileText } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
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
    <div className="min-h-screen bg-blue-50">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Welkom, {name}!
        </h1>
        <p className="text-gray-600 mb-8">
          Beheer uw afspraken en bekijk de status van uw auto
        </p>

        {/* actie kaarten */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          
          {/* afspraak maken */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer">
            <div className="bg-blue-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <CalendarDays className="text-blue-600" />
            </div>
            <h2 className="text-gray-800 font-semibold text-lg mb-2">Afspraak Maken</h2>
            <p className="text-gray-600 text-sm">
              Plan een nieuwe afspraak voor onderhoud, reparatie of APK keuring
            </p>
          </div>

          {/* mijn afspraken */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer">
            <div className="bg-green-100 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
              <FileText className="text-green-600" />
            </div>
            <h2 className="text-gray-800 font-semibold text-lg mb-2">Mijn Afspraken</h2>
            <p className="text-gray-600 text-sm">
              Bekijk de status van uw afspraken, facturen en laat een review achter
            </p>
          </div>
        </div>

        {/* hoe werkt het */}
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-gray-800 font-semibold text-lg mb-6">Hoe werkt het?</h2>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            
            {[
              {
                step: 1,
                title: "Maak Afspraak",
                desc: "Kies een datum en beschrijf wat er moet gebeuren",
              },
              {
                step: 2,
                title: "Bevestiging",
                desc: "Onze receptie bevestigt uw afspraak en wijst een monteur toe",
              },
              {
                step: 3,
                title: "Reparatie",
                desc: "Onze monteur voert de werkzaamheden uit",
              },
              {
                step: 4,
                title: "Ophalen",
                desc: "Betaal de factuur en haal uw auto op",
              },
            ].map((item) => (
              <div key={item.step}>
                <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                  {item.step}
                </div>
                <h3 className="text-gray-800 font-bold mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}