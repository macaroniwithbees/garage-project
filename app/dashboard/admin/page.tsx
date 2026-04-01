"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// ---- TYPES ----
type Repair = {
  created_at: string;
  price: number | null;
};

type WorkHour = {
  created_at: string;
  hours: number | null;
};

type ChartData = {
  month: string;
  value: number;
};

// ---- HELPERS ----
const groupByMonth = <T extends { created_at: string }>(
  rows: T[] | null,
  getValue: (row: T) => number
): ChartData[] => {
  const map: Record<string, number> = {};

  rows?.forEach((row) => {
    const date = new Date(row.created_at);

    const key = date.toLocaleString("nl-NL", {
      month: "short",
      year: "numeric",
    });

    if (!map[key]) map[key] = 0;
    map[key] += getValue(row);
  });

  return Object.entries(map)
    .slice(-6)
    .map(([month, value]) => ({ month, value }));
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<ChartData[]>([]);
  const [hoursData, setHoursData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserAndData = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        setLoading(false);
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const [{ data: stats, error: statsError }, { data: hours, error: hoursError }] =
        await Promise.all([
          supabase
            .from("repairs")
            .select("created_at, price")
            .order("created_at", { ascending: true }),

          supabase
            .from("work_hours")
            .select("created_at, hours")
            .order("created_at", { ascending: true }),
        ]);

      if (statsError || hoursError) {
        console.error(statsError || hoursError);
        setLoading(false);
        return;
      }

      const omzet = groupByMonth<Repair>(stats, (row) => Number(row.price) || 0);
      const uren = groupByMonth<WorkHour>(hours, (row) => Number(row.hours) || 0);

      setMonthlyStats(omzet);
      setHoursData(uren);

      setLoading(false);
    };

    getUserAndData();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  };

  if (loading) {
    return <p className="text-center mt-10">Loading dashboard...</p>;
  }

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
          Eigenaar Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Inzicht in omzet, uren en prestaties
        </p>

        {/* cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* profit */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-gray-800 font-semibold text-lg mb-4">
              Omzet Laatste 6 Maanden
            </h2>

            <pre className="text-xs bg-gray-100 p-3 rounded-lg">
              {JSON.stringify(monthlyStats, null, 2)}
            </pre>
          </div>

          {/* hours */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
            <h2 className="text-gray-800 font-semibold text-lg mb-4">
              Gewerkte Uren Laatste 6 Maanden
            </h2>

            <pre className="text-xs bg-gray-100 p-3 rounded-lg">
              {JSON.stringify(hoursData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}