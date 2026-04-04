"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ReviewModal from "./ReviewModal";

// statussen van een afspraak
type Status =
  | "in_afwachting"
  | "bevestigd"
  | "in_behandeling"
  | "klaar_voor_ophalen"
  | "afgerond";
// Type definitie voor een factuur, gekoppeld aan een afspraak
type Invoice = {
  appointment_id: number;
  totaalbedrag: number | null;
  betaald: string | null;
};
// Type definitie voor een afspraak, inclusief alle details die we willen tonen
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
  invoice?: Invoice;
};

// Kleuren en labels per status voor de badge
const statusConfig: Record<
  Status,
  { label: string; bg: string; text: string }
> = {
  in_afwachting: {
    label: "In afwachting",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
  },
  bevestigd: { label: "Bevestigd", bg: "bg-blue-100", text: "text-blue-800" },
  in_behandeling: {
    label: "In behandeling",
    bg: "bg-purple-100",
    text: "text-purple-800",
  },
  klaar_voor_ophalen: {
    label: "Klaar voor ophalen",
    bg: "bg-green-100",
    text: "text-green-800",
  },
  afgerond: {
    label: "Afgerond",
    bg: "bg-slate-100",
    text: "text-slate-800",
  },
};

// Vertaalt database-status naar een vast Status type
function normalizeStatus(status: string | null): Status {
  if (status === "bevestigd") return "bevestigd";
  if (status === "in_behandeling") return "in_behandeling";
  if (status === "klaar_voor_ophalen") return "klaar_voor_ophalen";
  if (status === "afgerond") return "afgerond";
  return "in_afwachting";
}

// Toont een gekleurd label met de status van de afspraak
function StatusBadge({ status }: { status: Status }) {
  const { label, bg, text } = statusConfig[status];
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${bg} ${text}`}
    >
      {label}
    </span>
  );
}

// Kaart die alle details van één afspraak toont (auto, status, factuur, review)
function AfspraakCard({
  afspraak,
  onBetaal,
  onReview,
  heeftReview,
}: {
  afspraak: Afspraak;
  onBetaal: (id: number) => void;
  onReview: () => void;
  heeftReview: boolean;
}) {
  const heeftFactuur =
    afspraak.invoice && afspraak.invoice.totaalbedrag != null;
  const isBetaald = afspraak.invoice?.betaald === "ja";

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
          <p className="text-sm font-semibold text-slate-700">
            Uw opmerkingen:
          </p>
          <p className="text-sm text-slate-600">{afspraak.opmerkingen}</p>
        </div>
      )}

      {/* Factuur */}
      {heeftFactuur && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">📄 Factuur</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                Totaal: €{afspraak.invoice!.totaalbedrag!.toFixed(2)}
              </p>
            </div>
            <div>
              {isBetaald ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                  ✅ Betaald
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onBetaal(afspraak.id)}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  💳 Betalen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review knop */}
      {isBetaald && !heeftReview && (
        <button
          type="button"
          onClick={() => onReview()}
          className="mt-4 w-full rounded-xl bg-yellow-500 py-3 text-sm font-semibold text-white transition hover:bg-yellow-600"
        >
          ⭐ Laat een review achter
        </button>
      )}
    </div>
  );
}

// Pop-up venster om een betaling te simuleren
function BetaalModal({
  open,
  bedrag,
  onClose,
  onBetaal,
  saving,
}: {
  open: boolean;
  bedrag: number;
  onClose: () => void;
  onBetaal: () => void;
  saving: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Betaling Simulatie
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Dit is een simulatie van de betaling. In een echte applicatie zou hier
          een betaalgateway worden geïntegreerd.
        </p>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm text-slate-600">Te betalen:</p>
          <p className="text-2xl font-bold text-slate-900">
            €{bedrag.toFixed(2)}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={onBetaal}
            disabled={saving}
            className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Verwerken..." : "Betaal Nu"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MijnAfspraken() {
  // Lijst van alle afspraken van de gebruiker
  const [afspraken, setAfspraken] = useState<Afspraak[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // State voor de betaal-popup (welke afspraak + bedrag)
  const [betaalModal, setBetaalModal] = useState<{
    appointmentId: number;
    bedrag: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  // State voor de review-popup
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasReview, setHasReview] = useState(false);

  // Haal alle afspraken op bij het laden van de pagina
  useEffect(() => {
    async function fetchAfspraken() {
      setErrorText(null);

      // Haal de ingelogde gebruiker op
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);
      // Haal alle afspraken van deze gebruiker op, gesorteerd op nieuwste eerst
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (error) {
        setErrorText(`Kon afspraken niet laden: ${error.message}`);
        setLoading(false);
        return;
      }
      // Als er afspraken zijn, haal dan ook de bijbehorende reparaties, monteurs, facturen en reviews op
      if (data) {
        const appointments = data as Array<{
          id: number;
          date: string | null;
          status: string | null;
          toegewezen_monteur: string | null;
        }>;
        // Haal alle unieke appointment IDs en toegewezen monteur IDs op uit de afspraken
        const appointmentIds = appointments.map((item) => item.id);
        const mechanicIds = appointments
          .map((item) => item.toegewezen_monteur)
          .filter((item): item is string => item !== null);

        // Haal de reparaties, monteurs, facturen en reviews op
        const [repairsResult, mechanicsResult, invoicesResult, reviewsResult] =
          await Promise.all([
            appointmentIds.length > 0
              ? supabase
                  .from("repairs")
                  .select("appointment_id, beschrijving")
                  .in("appointment_id", appointmentIds)
              : Promise.resolve({ data: [], error: null }),
            mechanicIds.length > 0
              ? supabase.from("users").select("id, naam").in("id", mechanicIds)
              : Promise.resolve({ data: [], error: null }),
            appointmentIds.length > 0
              ? supabase
                  .from("invoices")
                  .select("appointment_id, totaalbedrag, betaald")
                  .in("appointment_id", appointmentIds)
              : Promise.resolve({ data: [], error: null }),
            supabase
              .from("reviews")
              .select("id")
              .eq("user_id", user.id)
              .limit(1),
          ]);
        // Zet de opgehaalde data om in makkelijk te gebruiken maps en combineer alles tot één lijst van Afspraak-objecten
        const repairs = (repairsResult.data ?? []) as Array<{
          appointment_id: number;
          beschrijving: string | null;
        }>;
        const mechanics = (mechanicsResult.data ?? []) as Array<{
          id: string;
          naam: string | null;
        }>;
        const invoices = (invoicesResult.data ?? []) as Invoice[];
        setHasReview((reviewsResult.data ?? []).length > 0);

        // Koppel reparatie-beschrijvingen aan hun afspraak-ID
        const repairByAppointment = new Map<number, string>();
        for (const repair of repairs) {
          if (
            !repairByAppointment.has(repair.appointment_id) &&
            repair.beschrijving
          ) {
            repairByAppointment.set(repair.appointment_id, repair.beschrijving);
          }
        }

        // Koppel monteur-namen aan hun gebruikers-ID
        const mechanicById = new Map<string, string>();
        for (const mechanic of mechanics) {
          mechanicById.set(
            mechanic.id,
            mechanic.naam ?? `Monteur #${mechanic.id}`,
          );
        }

        // Koppel facturen aan hun afspraak-ID
        const invoiceByAppointment = new Map<number, Invoice>();
        for (const invoice of invoices) {
          invoiceByAppointment.set(invoice.appointment_id, invoice);
        }

        // Combineer alle data tot één Afspraak-object per appointment
        const mapped = appointments.map((item) => {
          const repairText = repairByAppointment.get(item.id) ?? "";
          const repairParts = repairText.split("|").map((part) => part.trim());

          // Merk en model zitten samen in één veld, dus we moeten ze splitsen
          const merkModelPart = repairParts[1] ?? "";
          const merkModelSplit = merkModelPart.split(" ");
          const merk = merkModelSplit[0] || "Onbekend";
          const model = merkModelSplit.slice(1).join(" ") || "";
          // Maak het uiteindelijke Afspraak-object dat we in de UI gaan gebruiken
          return {
            id: item.id,
            merk,
            model,
            kenteken: repairParts[2] || "-",
            dienst: repairParts[0] || "-",
            datum: item.date
              ? new Date(item.date).toLocaleDateString("nl-NL")
              : "-",
            opmerkingen: repairParts[3] || "",
            status: normalizeStatus(item.status),
            monteur: item.toegewezen_monteur
              ? mechanicById.get(item.toegewezen_monteur)
              : undefined,
            invoice: invoiceByAppointment.get(item.id),
          };
        });

        setAfspraken(mapped);
      }
      setLoading(false);
    }

    fetchAfspraken();
  }, []);

  // Opent de betaal-popup met het juiste bedrag
  const openBetaalModal = (appointmentId: number) => {
    const afspraak = afspraken.find((a) => a.id === appointmentId);
    if (!afspraak?.invoice?.totaalbedrag) return;
    setBetaalModal({ appointmentId, bedrag: afspraak.invoice.totaalbedrag });
  };

  // Verwerkt de betaling: factuur op betaald zetten + status naar afgerond
  const handleBetaal = async () => {
    if (!betaalModal) return;
    setSaving(true);

    const { error } = await supabase
      .from("invoices")
      .update({ betaald: "ja" })
      .eq("appointment_id", betaalModal.appointmentId);

    if (error) {
      setErrorText(`Betaling mislukt: ${error.message}`);
      setSaving(false);
      return;
    }

    // Status naar afgerond na betaling
    await supabase
      .from("appointments")
      .update({ status: "afgerond" })
      .eq("id", betaalModal.appointmentId);

    setAfspraken((prev) =>
      prev.map((a) =>
        a.id === betaalModal.appointmentId
          ? {
              ...a,
              status: "afgerond" as Status,
              invoice: a.invoice ? { ...a.invoice, betaald: "ja" } : a.invoice,
            }
          : a,
      ),
    );
    setBetaalModal(null);
    setSaving(false);
  };

  if (loading) {
    return <p className="text-slate-500">Afspraken laden...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900">Mijn Afspraken</h1>
      <p className="mb-6 text-slate-600">
        Bekijk de status en details van uw afspraken
      </p>
      {errorText && <p className="mb-4 text-red-600">{errorText}</p>}

      <div className="space-y-5">
        {afspraken.length === 0 ? (
          <p className="text-slate-500">U heeft nog geen afspraken.</p>
        ) : (
          afspraken.map((a) => (
            <AfspraakCard
              key={a.id}
              afspraak={a}
              onBetaal={openBetaalModal}
              onReview={() => setReviewModalOpen(true)}
              heeftReview={hasReview}
            />
          ))
        )}
      </div>

      <BetaalModal
        open={betaalModal !== null}
        bedrag={betaalModal?.bedrag ?? 0}
        onClose={() => setBetaalModal(null)}
        onBetaal={handleBetaal}
        saving={saving}
      />

      <ReviewModal
        open={reviewModalOpen}
        userId={userId}
        onClose={() => setReviewModalOpen(false)}
        onSubmitted={() => {
          setHasReview(true);
          setReviewModalOpen(false);
        }}
      />
    </div>
  );
}
