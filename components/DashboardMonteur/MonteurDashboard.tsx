"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Car,
  CheckCircle2,
  CircleUserRound,
  LogOut,
  Wrench,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import WerkzaamhedenModal from "./WerkzaamhedenModal";

// Type voor een afspraak zoals de monteur die ziet
type MonteurAppointment = {
  id: number;
  voertuig: string;
  klant: string;
  dienst?: string;
  datum?: string;
  opmerkingen?: string;
  status: "toegewezen" | "bezig" | "klaar";
};

// Zet een datum string om naar Nederlands formaat (dd-mm-jjjj)
const toDateLabel = (dateValue: string | null): string | undefined => {
  if (!dateValue) return undefined;
  return new Date(dateValue).toLocaleDateString("nl-NL");
};

// Vertaalt de database status naar een van de drie mogelijke st atussen
const normalizeStatus = (
  status: string | null,
): MonteurAppointment["status"] => {
  if (status === "in behandeling" || status === "in_behandeling")
    return "bezig";
  if (status === "klaar_voor_ophalen" || status === "afgerond") return "klaar";
  if (status === "ingepland" || status === "in_afwachting") return "toegewezen";
  return "toegewezen";
};

// Labels die bij elke status horen
const STATUS_LABEL: Record<MonteurAppointment["status"], string> = {
  toegewezen: "Toegewezen",
  bezig: "Bezig",
  klaar: "Klaar",
};

// Kleuren die bij elke status horen
const STATUS_COLORS: Record<MonteurAppointment["status"], string> = {
  toegewezen: "bg-blue-100 text-blue-700",
  bezig: "bg-purple-100 text-purple-700",
  klaar: "bg-green-100 text-green-700",
};

type AppointmentCardProps = {
  appointment: MonteurAppointment;
  action?: React.ReactNode;
};

// Kaart component dat één afspraak toont met optionele actieknop
function MonteurAppointmentCard({ appointment, action }: AppointmentCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h3 className="text-[34px] leading-none font-bold text-slate-900 sm:text-3xl md:text-[34px]">
              {appointment.voertuig}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-base font-medium ${STATUS_COLORS[appointment.status]}`}
            >
              {STATUS_LABEL[appointment.status]}
            </span>
          </div>

          <p className="text-xl text-slate-600">
            <span className="font-semibold text-slate-700">Klant:</span>{" "}
            {appointment.klant}
          </p>
          {appointment.dienst && (
            <p className="mt-1 text-xl text-slate-600">
              <span className="font-semibold text-slate-700">Dienst:</span>{" "}
              {appointment.dienst}
            </p>
          )}
        </div>

        <div className="min-w-65 text-xl text-slate-600">
          {appointment.datum && (
            <p>
              <span className="font-semibold text-slate-700">Datum:</span>{" "}
              {appointment.datum}
            </p>
          )}
        </div>
      </div>

      {appointment.opmerkingen && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-lg text-amber-800">
          <span className="font-semibold">Klant opmerkingen:</span>{" "}
          {appointment.opmerkingen}
        </div>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default function MonteurDashboard() {
  const router = useRouter();

  // State voor afspraken, gebruikersinfo, laden en fouten
  const [appointments, setAppointments] = useState<MonteurAppointment[]>([]);
  const [profileName, setProfileName] = useState("Monteur");
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<MonteurAppointment | null>(null);
  const [isMonteur, setIsMonteur] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Laad alle afspraakdata bij het openen van de pagina
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorText("");

      // Haal de ingelogde gebruiker op
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData.user;
      setCurrentUser(authUser);

      let monteurId: string | null = null;
      let monteurNaam = "Monteur";

      // Controleer of de gebruiker een monteur is
      if (authUser) {
        const { data: userRow, error: userError } = await supabase
          .from("users")
          .select("id, naam, rol")
          .eq("id", authUser.id)
          .single();
        // Als er geen fout is en er een gebruiker is, controleer dan de rol
        if (!userError && userRow) {
          const row = userRow as {
            id: string;
            naam: string | null;
            rol: string | null;
          }; //als de gebruiker een monteur is, sla dan de ID en naam op voor later gebruik
          // Wat betekent dat we alleen afspraken gaan laden als de gebruiker een monteur is.
          if (row.rol?.toLowerCase() === "monteur") {
            setIsMonteur(true);
            monteurId = row.id;
            monteurNaam =
              row.naam ?? authUser.email?.split("@")[0] ?? "Monteur";
          }
        }
      }

      setProfileName(monteurNaam);
      // Als er geen ingelogde gebruiker is of de gebruiker is geen monteur, stop dan met laden en laat een lege lijst zien
      if (!authUser || !monteurId) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      // Haal alle afspraken op die aan deze monteur zijn toegewezen
      const { data: appointmentRows, error: apptError } = await supabase
        .from("appointments")
        .select("id, date, status, user_id, toegewezen_monteur")
        .eq("toegewezen_monteur", monteurId)
        .order("date", { ascending: true });

      if (apptError) {
        setErrorText(`Afspraken laden mislukt: ${apptError.message}`);
        setLoading(false);
        return;
      }

      // Verzamel unieke klant-IDs uit de afspraken
      const userIds = [
        ...new Set(
          (appointmentRows ?? [])
            .map((a: { user_id: string | null }) => a.user_id)
            .filter((id): id is string => id !== null),
        ),
      ];

      // Haal klantnamen op uit de users tabel
      const klantById = new Map<string, string>();
      if (userIds.length > 0) {
        const { data: klantRows } = await supabase
          .from("users")
          .select("id, naam")
          .in("id", userIds);
        for (const k of klantRows ?? []) {
          const row = k as {
            id: string;
            naam: string | null;
          };
          klantById.set(row.id, row.naam ?? `Klant`);
        }
      }

      // Haal reparatie-info op (dienst, voertuig, opmerkingen) uit de repairs tabel
      const apptIds = (appointmentRows ?? []).map((a: { id: number }) => a.id);
      const dienstById = new Map<number, string>();
      const voertuigById = new Map<number, string>();
      const opmerkingenById = new Map<number, string>();
      // als er afspraken zijn, haal ze dan op en verwerk ze.
      if (apptIds.length > 0) {
        const { data: repairRows } = await supabase
          .from("repairs")
          .select("appointment_id, beschrijving")
          .in("appointment_id", apptIds);
        // voor elke reparatierij, splits de beschrijving en sla de dienst, voertuig en opmerkingen op in maps die gekoppeld zijn aan de afspraak-ID's.
        for (const r of repairRows ?? []) {
          const row = r as {
            appointment_id: number;
            beschrijving: string | null;
          };
          // We controleren of we deze afspraak-ID al hebben verwerkt om dubbele verwerking te voorkomen.
          if (!dienstById.has(row.appointment_id) && row.beschrijving) {
            const parts = row.beschrijving
              .split("|")
              .map((part) => part.trim());
            dienstById.set(row.appointment_id, parts[0] || row.beschrijving);
            if (parts[1]) voertuigById.set(row.appointment_id, parts[1]);
            if (parts[3]) opmerkingenById.set(row.appointment_id, parts[3]);
          }
        }
      }

      // Zet de database rijen om naar MonteurAppointment objecten
      const mapped: MonteurAppointment[] = (appointmentRows ?? []).map(
        (row) => {
          const r = row as {
            id: number;
            date: string | null;
            status: string | null;
            user_id: string | null;
          };
          //daarna returnen we een nieuw object met alle benodigde info voor de monteur, waarbij we de maps gebruiken om de dienst, voertuig en opmerkingen te koppelen aan de juiste afspraak-ID's.
          return {
            id: r.id,
            voertuig: voertuigById.get(r.id) ?? `Voertuig #${r.id}`,
            klant: r.user_id
              ? (klantById.get(r.user_id) ?? "Onbekend")
              : "Onbekend",
            dienst: dienstById.get(r.id),
            datum: toDateLabel(r.date),
            opmerkingen: opmerkingenById.get(r.id),
            status: normalizeStatus(r.status),
          };
        },
      );

      setAppointments(mapped);
      setLoading(false);
    };

    void loadData();
  }, []);

  // Filter afspraken per status voor de drie secties
  const assignedAppointments = useMemo(
    () =>
      appointments.filter((appointment) => appointment.status === "toegewezen"),
    [appointments],
  );
  const inProgressAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === "bezig"),
    [appointments],
  );
  const completedAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === "klaar"),
    [appointments],
  );

  // Zet de status van een afspraak op "bezig" in de database
  const handleStartWerkzaamheden = async (id: number) => {
    if (!isMonteur) {
      setErrorText("Alleen monteurs kunnen werkzaamheden starten.");
      return;
    }

    const statusCandidates = ["in behandeling"];
    let lastError: string | null = null;

    // Probeer de status bij te werken in de database
    for (const statusValue of statusCandidates) {
      const { error } = await supabase
        .from("appointments")
        .update({ status: statusValue })
        .eq("id", id);
      if (!error) {
        lastError = null;
        break;
      }
      lastError = error.message;
    }

    if (lastError) {
      setErrorText(`Status bijwerken mislukt: ${lastError}`);
      return;
    }

    // Werk de lokale state bij zodat de UI direct wordt geüpdatet
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: "bezig" }
          : appointment,
      ),
    );
  };

  // Opent de modal om werkzaamheden te registreren
  const openModal = (appointment: MonteurAppointment) => {
    if (!isMonteur) {
      setErrorText("Alleen monteurs kunnen werkzaamheden registreren.");
      return;
    }
    // We slaan de hele afspraak op in de state zodat we alle benodigde info hebben in de modal.
    setSelectedAppointment(appointment);
  };
  // Sluit de modal en reset de geselecteerde afspraak
  const closeModal = () => {
    setSelectedAppointment(null);
  };

  // Na voltooien: zet lokale status op "klaar" en sluit de modal
  const handleCompleted = (appointmentId: number) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: "klaar" }
          : appointment,
      ),
    );
    closeModal();
  };

  // Logt de gebruiker uit en stuurt terug naar de homepagina
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-8 py-4">
        <div className="mx-auto flex w-full max-w-312.5 items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="text-blue-600" />
            <span className="text-[38px] font-bold">AutoGarage Pro</span>
          </div>

          <div className="flex items-center gap-6 text-xl">
            <div className="flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2 text-purple-700">
              <CircleUserRound size={20} />
              <span className="font-medium">{profileName}</span>
              {isMonteur && <span className="text-slate-500">(Monteur)</span>}
            </div>

            {currentUser && (
              <button
                type="button"
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                Uitloggen
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-312.5 px-8 py-10">
        <Link
          href="/dashboard/klant"
          className="mb-6 inline-block text-xl text-blue-600 hover:underline"
        >
          ← Terug naar dashboard
        </Link>
        <h1 className="text-5xl font-bold">Monteur Dashboard</h1>
        <p className="mt-3 text-2xl text-slate-600">
          Uw toegewezen afspraken en werkzaamheden
        </p>

        {loading && (
          <p className="mt-6 text-lg text-slate-600">Data laden...</p>
        )}
        {errorText && <p className="mt-6 text-lg text-red-600">{errorText}</p>}

        {!loading && !currentUser && (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-blue-500" />
            <p className="text-2xl font-semibold text-slate-700">
              Je bent niet ingelogd
            </p>
            <p className="mt-2 text-lg text-slate-500">
              Log in als monteur om je toegewezen afspraken te zien.
            </p>
          </div>
        )}

        {!loading && currentUser && isMonteur && (
          <div className="mt-10 space-y-10">
            <section>
              <h2 className="mb-4 text-4xl font-bold">
                Toegewezen ({assignedAppointments.length})
              </h2>
              <div className="space-y-5">
                {assignedAppointments.map((appointment) => (
                  <MonteurAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    action={
                      <button
                        type="button"
                        onClick={() => handleStartWerkzaamheden(appointment.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-2xl font-medium text-white hover:bg-purple-700"
                      >
                        <Wrench size={24} />
                        Start Werkzaamheden
                      </button>
                    }
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-4xl font-bold">
                In Behandeling ({inProgressAppointments.length})
              </h2>
              <div className="space-y-5">
                {inProgressAppointments.map((appointment) => (
                  <MonteurAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    action={
                      <button
                        type="button"
                        onClick={() => openModal(appointment)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          borderRadius: "16px",
                          backgroundColor: "#16a34a",
                          padding: "12px",
                          fontSize: "1.5rem",
                          fontWeight: 500,
                          color: "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        <CheckCircle2 size={24} />
                        Werkzaamheden Registreren & Voltooien
                      </button>
                    }
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-4xl font-bold">
                Afgerond ({completedAppointments.length})
              </h2>
              <div className="space-y-5">
                {completedAppointments.map((appointment) => (
                  <MonteurAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                  />
                ))}
              </div>
            </section>

            {assignedAppointments.length === 0 &&
              inProgressAppointments.length === 0 &&
              completedAppointments.length === 0 &&
              !errorText && (
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
                  <CheckCircle2
                    size={48}
                    className="mx-auto mb-4 text-green-500"
                  />
                  <p className="text-2xl font-semibold text-slate-700">
                    Geen werkzaamheden gevonden
                  </p>
                  <p className="mt-2 text-lg text-slate-500">
                    Er zijn momenteel geen afspraken aan jou toegewezen.
                  </p>
                </div>
              )}
          </div>
        )}
      </main>

      <WerkzaamhedenModal
        open={selectedAppointment !== null}
        appointmentId={selectedAppointment?.id ?? null}
        voertuig={selectedAppointment?.voertuig ?? ""}
        isMonteur={isMonteur}
        onClose={closeModal}
        onCompleted={handleCompleted}
      />
    </div>
  );
}
