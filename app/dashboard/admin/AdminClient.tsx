"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";

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
  kosten: number | null;
  uren: number | null;
  appointments: {
    date: string;
  }[] | null;
};

type ChartData = {
  month: string;
  value: number;
};

// ---- HELPERS ----
const groupByMonth = <T,>(
  rows: T[] | null,
  getValue: (row: T) => number,
  getDate: (row: T) => string | null | undefined,
  startDate?: Date,
  endDate?: Date
): ChartData[] => {
  const map: Record<string, number> = {};

  rows?.forEach((row) => {
    const rawDate = getDate(row);
    if (!rawDate) return;
    const date = new Date(rawDate);

    if (startDate && date < startDate) return;
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (date > endOfDay) return;
    }

    const key = date.toLocaleString("nl-NL", { month: "short", year: "numeric" });
    if (!map[key]) map[key] = 0;
    map[key] += getValue(row);
  });

  return Object.entries(map)
    .map(([month, value]) => ({ month, value }))
    .sort(
      (a, b) =>
        new Date(Date.parse("1 " + a.month)).getTime() -
        new Date(Date.parse("1 " + b.month)).getTime()
    );
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<ChartData[]>([]);
  const [hoursData, setHoursData] = useState<ChartData[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
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

    const { data: repairs, error: repairsError } = await supabase
      .from("repairs")
      .select("kosten, uren, appointments(date)");
    
    console.log("repairs data:", repairs); // toegevoegd voor debugging
    console.log("repairs error:", repairsError);

    if (repairsError) {
      console.error(repairsError);
      setLoading(false);
      return;
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const getDate = (row: Repair) => {
      const appt = row.appointments as any;
      if (Array.isArray(appt)) return appt[0]?.date ?? null;
      return appt?.date ?? null;
    };    

    setMonthlyStats(
      groupByMonth<Repair>(
        repairs as unknown as Repair[],
        (row) => Number(row.kosten) || 0,
        getDate,
        start,
        end
      )
    );
    setHoursData(
      groupByMonth<Repair>(
        repairs as unknown as Repair[],
        (row) => Number(row.uren) || 0,
        getDate,
        start,
        end
      )
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/");
  };

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (!user) return <p className="text-center mt-10">Je bent nog niet ingelogd</p>;

  return (
    <AppLayout user={user} onLogout={handleLogout}>
        {/* header + date range picker */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Eigenaar Dashboard</h1>
            <p className="text-gray-600">Inzicht in omzet, uren en prestaties</p>
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black text-sm bg-white shadow-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-black text-sm bg-white shadow-sm"
            />
          </div>
        </div>

        {/* chart cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* profit */}
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-gray-800 font-semibold text-lg mb-2">Omzet</h2>
            <div style={{ width: "100%", height: "240px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyStats}>
                  <Legend />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Omzet" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* hours */}
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-gray-800 font-semibold text-lg mb-2">Gewerkte Uren</h2>
            <div style={{ width: "100%", height: "240px" }}>
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
      </AppLayout>
  );
}