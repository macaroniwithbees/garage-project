"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

// ---- CHARTS ----
import {
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

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
  getValue: (row: T) => number,
  monthsToShow: number
): ChartData[] => {
  const map: Record<string, number> = {};

  rows?.forEach((row) => {
    const date = new Date(row.created_at);
    const key = date.toLocaleString("nl-NL", { month: "short", year: "numeric" });

    if (!map[key]) map[key] = 0;
    map[key] += getValue(row);
  });

  return Object.entries(map)
    .slice(-monthsToShow)
    .map(([month, value]) => ({ month, value }));
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<ChartData[]>([]);
  const [hoursData, setHoursData] = useState<ChartData[]>([]);
  const [monthsToShow, setMonthsToShow] = useState(6);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserAndData = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        setLoading(false);
        return;
      }

      setUser(user);

      const [{ data: stats, error: statsError }, { data: hours, error: hoursError }] =
        await Promise.all([
          supabase.from("repairs").select("created_at, price").order("created_at", { ascending: true }),
          supabase.from("work_hours").select("created_at, hours").order("created_at", { ascending: true }),
        ]);

      if (statsError || hoursError) {
        console.error(statsError || hoursError);
        setLoading(false);
        return;
      }

      const omzet = groupByMonth<Repair>(stats, (row) => Number(row.price) || 0, monthsToShow);
      const uren = groupByMonth<WorkHour>(hours, (row) => Number(row.hours) || 0, monthsToShow);

      setMonthlyStats(omzet);
      setHoursData(uren);

      setLoading(false);
    };

    getUserAndData();
  }, [monthsToShow]); 

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  };

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (!user) return <p className="text-center mt-10">Je bent nog niet ingelogd</p>;

  const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Gebruiker";

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* header met filter */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Eigenaar Dashboard</h1>
            <p className="text-gray-600">Inzicht in omzet, uren en prestaties</p>
          </div>

          {/* filter */}
          <div>
            <select
              value={monthsToShow}
              onChange={(e) => setMonthsToShow(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value={3}>Laatste 3 maanden</option>
              <option value={6}>Laatste 6 maanden</option>
              <option value={12}>Laatste 12 maanden</option>
            </select>
          </div>
        </div>

        {/* chart cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* profit */}
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-gray-800 font-semibold text-lg mb-2">
              Omzet Laatste {monthsToShow} Maanden
            </h2>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats}>
                  <Legend />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* hours */}
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-gray-800 font-semibold text-lg mb-2">
              Gewerkte Uren Laatste {monthsToShow} Maanden
            </h2>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursData}>
                  <Legend />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} uur`} />
                  <Bar dataKey="value" fill="#10b981" name="Uren" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}