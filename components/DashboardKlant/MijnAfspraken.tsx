"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Status = "in_afwachting" | "bevestigd" | "in_behandeling" | "klaar_voor_ophalen";

type Afspraak = {
  id: number;
  merk: string;
  model: string;
  kenteken: string;
  dienst: string;
  datum: string;
  opmerkingen: string;
  status: Status;
  monteur?: string;
};

const statusConfig: Record<Status, { label: string; bg: string; text: string }> = {
  in_afwachting: { label: "In afwachting", bg: "bg-yellow-100", text: "text-yellow-800" },
  bevestigd: { label: "Bevestigd", bg: "bg-blue-100", text: "text-blue-800" },
  in_behandeling: { label: "In behandeling", bg: "bg-purple-100", text: "text-purple-800" },
  klaar_voor_ophalen: { label: "Klaar voor ophalen", bg: "bg-green-100", text: "text-green-800" },
};

function normalizeStatus(status: string | null): Status {
  if (status === "bevestigd" || status === "confirmed") return "bevestigd";
  if (status === "in_behandeling" || status === "in_progress") return "in_behandeling";
  if (status === "klaar_voor_ophalen" || status === "ready_for_pickup") return "klaar_voor_ophalen";
  return "in_afwachting";
}

function StatusBadge({ status }: { status: Status }) {
  const { label, bg, text } = statusConfig[status];
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${bg} ${text}`}>
      {label}
    </span>
  );
}

function AfspraakCard({ afspraak }: { afspraak: Afspraak }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Kop: auto + status (+ monteur rechts) */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">
              {afspraak.merk} {afspraak.model}
            </h3>
            <StatusBadge status={afspraak.status} />
          </div>

          <p className="text-sm text-slate-700">
            <span className="font-semibold">Kenteken:</span> {afspraak.kenteken}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Dienst:</span> {afspraak.dienst}
          </p>
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Datum:</span> {afspraak.datum}
          </p>
        </div>

        {afspraak.monteur && (
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Monteur:</span> {afspraak.monteur}
          </p>
        )}
      </div>

      {/* Opmerkingen */}
      {afspraak.opmerkingen && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Uw opmerkingen:</p>
          <p className="text-sm text-slate-600">{afspraak.opmerkingen}</p>
        </div>
      )}
    </div>
  );
}

export default function MijnAfspraken() {
  const [afspraken, setAfspraken] = useState<Afspraak[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAfspraken() {
      setErrorText(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("email", user.email ?? "")
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", profile.id)
        .order("id", { ascending: false });

      if (error) {
        setErrorText(`Kon afspraken niet laden: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data) {
        const appointments = data as Array<{
          id: number;
          voertuig: string | null;
          merk: string | null;
          model: string | null;
          kenteken: string | null;
          datum: string | null;
          opmerkingen: string | null;
          status: string | null;
          toegewezen_monteur: number | null;
        }>;

        const appointmentIds = appointments.map((item) => item.id);
        const mechanicIds = appointments
          .map((item) => item.toegewezen_monteur)
          .filter((item): item is number => item !== null);

        const [repairsResult, mechanicsResult] = await Promise.all([
          appointmentIds.length > 0
            ? supabase.from("repairs").select("appointment_id, beschrijving").in("appointment_id", appointmentIds)
            : Promise.resolve({ data: [], error: null }),
          mechanicIds.length > 0
            ? supabase.from("users").select("id, naam").in("id", mechanicIds)
            : Promise.resolve({ data: [], error: null }),
        ]);

        const repairs = (repairsResult.data ?? []) as Array<{ appointment_id: number; beschrijving: string | null }>;
        const mechanics = (mechanicsResult.data ?? []) as Array<{ id: number; naam: string | null }>;

        const repairByAppointment = new Map<number, string>();
        for (const repair of repairs) {
          if (!repairByAppointment.has(repair.appointment_id) && repair.beschrijving) {
            repairByAppointment.set(repair.appointment_id, repair.beschrijving);
          }
        }

        const mechanicById = new Map<number, string>();
        for (const mechanic of mechanics) {
          mechanicById.set(mechanic.id, mechanic.naam ?? `Monteur #${mechanic.id}`);
        }

        const mapped = appointments.map((item) => {
          const repairText = repairByAppointment.get(item.id) ?? "";
          const repairParts = repairText.split("|").map((part) => part.trim());
          const voertuigDelen = (item.voertuig ?? "").split("-");
          const merkModel = voertuigDelen[0]?.trim() ?? "";
          const kenteken = voertuigDelen[1]?.trim() ?? "";

          return {
            id: item.id,
            merk: item.merk ?? (merkModel || "Onbekend"),
            model: item.model ?? "",
            kenteken: item.kenteken ?? (kenteken || repairParts[2] || "-"),
            dienst: repairParts[0] || repairByAppointment.get(item.id) || "-",
            datum: item.datum ? new Date(item.datum).toLocaleDateString("nl-NL") : "-",
            opmerkingen: item.opmerkingen?.trim() || repairParts[3] || "",
            status: normalizeStatus(item.status),
            monteur: item.toegewezen_monteur ? mechanicById.get(item.toegewezen_monteur) : undefined,
          };
        });

        setAfspraken(mapped);
      }
      setLoading(false);
    }

    fetchAfspraken();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Afspraken laden...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900">Mijn Afspraken</h1>
      <p className="mb-6 text-slate-600">Bekijk de status en details van uw afspraken</p>
      {errorText && <p className="mb-4 text-red-600">{errorText}</p>}

      <div className="space-y-5">
        {afspraken.length === 0 ? (
          <p className="text-slate-500">U heeft nog geen afspraken.</p>
        ) : (
          afspraken.map((a) => <AfspraakCard key={a.id} afspraak={a} />)
        )}
      </div>
    </div>
  );
}
