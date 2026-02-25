"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Status = "in_afwachting" | "bevestigd" | "klaar_voor_ophalen";

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
  klaar_voor_ophalen: { label: "Klaar voor ophalen", bg: "bg-green-100", text: "text-green-800" },
};

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

  useEffect(() => {
    async function fetchAfspraken() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("afspraken")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAfspraken(data as Afspraak[]);
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
