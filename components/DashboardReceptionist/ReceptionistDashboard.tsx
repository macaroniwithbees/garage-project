"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Car,
  CheckCircle2,
  CircleUserRound,
  CreditCard,
  LogOut,
  UserRoundPlus,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import AppointmentCard from "./AppointmentCard";
import AssignMechanic from "./AssignMechanic";
import { normalizeStatus, toDateLabel } from "./helpers";
import type {
  AppointmentRow,
  InvoiceRow,
  MechanicOption,
  ReceptionistAppointment,
  RepairRow,
  UserRow,
} from "./types";

export default function ReceptionistDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<ReceptionistAppointment[]>(
    [],
  );
  const [mechanics, setMechanics] = useState<MechanicOption[]>([]);
  const [profileName, setProfileName] = useState("Receptionist");
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<ReceptionistAppointment | null>(null);
  const [selectedMechanic, setSelectedMechanic] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setErrorText("");

      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;

      const [
        appointmentsResponse,
        usersResponse,
        repairsResponse,
        invoicesResponse,
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select("*")
          .order("id", { ascending: false }),
        supabase.from("users").select("id, naam, rol"),
        supabase.from("repairs").select("appointment_id, beschrijving"),
        supabase.from("invoices").select("appointment_id, betaald"),
      ]);

      if (appointmentsResponse.error) {
        setErrorText(
          `Kon afspraken niet laden: ${appointmentsResponse.error.message}`,
        );
        setLoading(false);
        return;
      }
      if (usersResponse.error) {
        setErrorText(
          `Kon gebruikers niet laden: ${usersResponse.error.message}`,
        );
        setLoading(false);
        return;
      }

      const appointmentRows = (appointmentsResponse.data ??
        []) as AppointmentRow[];
      const userRows = (usersResponse.data ?? []) as UserRow[];
      const repairRows = (repairsResponse.data ?? []) as RepairRow[];
      const invoiceRows = (invoicesResponse.data ?? []) as InvoiceRow[];

      const userById = new Map<string, UserRow>(
        userRows.map((user) => [user.id, user]),
      );
      const serviceByAppointmentId = new Map<number, string>();
      const voertuigByAppointmentId = new Map<number, string>();
      const notesByAppointmentId = new Map<number, string>();
      const invoiceByAppointmentId = new Map<number, InvoiceRow>();

      for (const repair of repairRows) {
        if (
          !serviceByAppointmentId.has(repair.appointment_id) &&
          repair.beschrijving
        ) {
          const repairParts = repair.beschrijving
            .split("|")
            .map((part) => part.trim());
          const parsedService = repairParts[0] || repair.beschrijving;
          const parsedVoertuig = repairParts[1] || "";
          const parsedNote = repairParts[3] || "";
          serviceByAppointmentId.set(repair.appointment_id, parsedService);
          if (parsedVoertuig) {
            voertuigByAppointmentId.set(repair.appointment_id, parsedVoertuig);
          }
          if (parsedNote) {
            notesByAppointmentId.set(repair.appointment_id, parsedNote);
          }
        }
      }
      for (const invoice of invoiceRows) {
        invoiceByAppointmentId.set(invoice.appointment_id, invoice);
      }

      setMechanics(
        userRows
          .filter((user) => (user.rol ?? "").toLowerCase() === "monteur")
          .map((user) => ({
            id: user.id,
            naam: user.naam ?? user.email ?? `Monteur #${user.id}`,
          })),
      );

      if (currentUser) {
        const receptionist = userRows.find(
          (user) => user.id === currentUser.id,
        );
        setProfileName(
          receptionist?.naam ??
            currentUser.user_metadata?.full_name ??
            currentUser.email?.split("@")[0] ??
            "Receptionist",
        );
      }

      const mappedAppointments = appointmentRows.map((appointment) => {
        const customer = appointment.user_id
          ? userById.get(appointment.user_id)
          : undefined;
        const mechanic = appointment.toegewezen_monteur
          ? userById.get(appointment.toegewezen_monteur)
          : undefined;
        const invoice = invoiceByAppointmentId.get(appointment.id);

        return {
          id: appointment.id,
          voertuig:
            voertuigByAppointmentId.get(appointment.id) ??
            `Afspraak #${appointment.id}`,
          klant: customer?.naam ?? `Klant #${appointment.user_id ?? "-"}`,
          dienst: serviceByAppointmentId.get(appointment.id),
          datum: toDateLabel(appointment.date),
          opmerkingen: notesByAppointmentId.get(appointment.id) ?? undefined,
          monteur: mechanic?.naam ?? undefined,
          klantBetaald: invoice ? invoice.betaald === "ja" : false,
          betaald: false,
          status: normalizeStatus(appointment.status),
        } satisfies ReceptionistAppointment;
      });

      setAppointments(mappedAppointments);
      setLoading(false);
    };

    void loadDashboardData();
  }, []);

  const isAssignOpen = useMemo(
    () => selectedAppointment !== null,
    [selectedAppointment],
  );
  const toConfirm = useMemo(
    () => appointments.filter((item) => item.status === "in_afwachting"),
    [appointments],
  );
  const toAssign = useMemo(
    () => appointments.filter((item) => item.status === "ingepland"),
    [appointments],
  );
  const inProgress = useMemo(
    () => appointments.filter((item) => item.status === "in behandeling"),
    [appointments],
  );
  const readyForPickup = useMemo(
    () => appointments.filter((item) => item.status === "klaar_voor_ophalen"),
    [appointments],
  );
  const afgerond = useMemo(
    () => appointments.filter((item) => item.status === "afgerond"),
    [appointments],
  );

  const updateStatusWithFallback = async (
    appointmentId: number,
    statusCandidates: string[],
    mechanicId?: string,
  ) => {
    let lastError: string | null = null;

    for (const statusValue of statusCandidates) {
      const payload = mechanicId
        ? { status: statusValue, toegewezen_monteur: mechanicId }
        : { status: statusValue };
      const { error } = await supabase
        .from("appointments")
        .update(payload)
        .eq("id", appointmentId);
      if (!error) return null;
      lastError = error.message;
    }

    return lastError;
  };

  const handleConfirm = async (id: number) => {
    const errorMessage = await updateStatusWithFallback(id, ["ingepland"]);
    if (errorMessage) {
      setErrorText(`Bevestigen mislukt: ${errorMessage}`);
      return;
    }
    setAppointments((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, status: "ingepland", opmerkingen: undefined }
          : item,
      ),
    );
  };

  const handleMarkBetaald = async (id: number) => {
    // Controleer eerst of de klant al betaald heeft in de database
    const { data: invoice, error: fetchError } = await supabase
      .from("invoices")
      .select("betaald")
      .eq("appointment_id", id)
      .single();

    if (fetchError || !invoice) {
      setErrorText("Kon factuurstatus niet ophalen. Probeer het opnieuw.");
      return;
    }

    if (invoice.betaald !== "ja") {
      setErrorText(
        "De klant heeft nog niet betaald. U kunt dit pas markeren als de klant de factuur heeft voldaan.",
      );
      return;
    }

    // Klant heeft betaald, receptionist bevestigt nu — zet status naar afgerond
    const statusCandidates = ["afgerond"];
    let lastError: string | null = null;
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
      setErrorText(`Bevestigen mislukt: ${lastError}`);
      return;
    }

    setAppointments((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, status: "afgerond", klantBetaald: true, betaald: true }
          : item,
      ),
    );
    setErrorText("");
  };

  const openAssign = (appointment: ReceptionistAppointment) => {
    setSelectedAppointment(appointment);
    setSelectedMechanic("");
  };

  const closeAssign = () => {
    setSelectedAppointment(null);
    setSelectedMechanic("");
  };

  const handleAssignMechanic = () => {
    if (!selectedAppointment || !selectedMechanic) return;

    const mechanicId = selectedMechanic;
    const mechanic = mechanics.find((item) => item.id === mechanicId);
    if (!mechanic) return;

    void (async () => {
      const errorMessage = await updateStatusWithFallback(
        selectedAppointment.id,
        ["in_behandeling"],
        mechanicId,
      );

      if (errorMessage) {
        setErrorText(`Monteur toewijzen mislukt: ${errorMessage}`);
        return;
      }

      setAppointments((previous) =>
        previous.map((item) =>
          item.id === selectedAppointment.id
            ? { ...item, status: "in behandeling", monteur: mechanic.naam }
            : item,
        ),
      );

      closeAssign();
    })();
  };

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
            <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-blue-700">
              <CircleUserRound size={20} />
              <span className="font-medium">{profileName}</span>
              <span className="text-slate-500">(Receptionist)</span>
            </div>
            <button
              className="flex items-center gap-2 text-slate-700"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-312.5 px-8 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-block text-blue-600 hover:underline text-xl"
        >
          ← Terug naar dashboard
        </Link>
        <h1 className="text-5xl font-bold">Receptionist Dashboard</h1>
        <p className="mt-3 text-2xl text-slate-600">
          Beheer afspraken en communiceer met klanten
        </p>
        {loading && (
          <p className="mt-6 text-lg text-slate-600">Data laden...</p>
        )}
        {errorText && <p className="mt-6 text-lg text-red-600">{errorText}</p>}

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="mb-4 text-4xl font-bold">
              Te Bevestigen ({toConfirm.length})
            </h2>
            <div className="space-y-5">
              {toConfirm.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  action={
                    <button
                      type="button"
                      onClick={() => handleConfirm(appointment.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-2xl font-medium text-white hover:bg-blue-700"
                    >
                      <CheckCircle2 size={24} />
                      Bevestig Afspraak
                    </button>
                  }
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-4xl font-bold">
              Toe te Wijzen ({toAssign.length})
            </h2>
            <div className="space-y-5">
              {toAssign.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  action={
                    <button
                      type="button"
                      onClick={() => openAssign(appointment)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-2xl font-medium text-white hover:bg-purple-700"
                    >
                      <UserRoundPlus size={24} />
                      Wijs Monteur Toe
                    </button>
                  }
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-4xl font-bold">
              In Behandeling ({inProgress.length})
            </h2>
            <div className="space-y-5">
              {inProgress.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-4xl font-bold">
              Klaar voor Ophalen ({readyForPickup.length})
            </h2>
            <div className="space-y-5">
              {readyForPickup.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  action={
                    !appointment.betaald ? (
                      <button
                        type="button"
                        onClick={() => handleMarkBetaald(appointment.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-2xl font-medium text-white hover:bg-green-700"
                      >
                        <CreditCard size={24} />
                        Bevestig Betaling
                      </button>
                    ) : undefined
                  }
                  footer={
                    appointment.betaald
                      ? "✅ Betaald bevestigd — Klant kan auto ophalen"
                      : appointment.klantBetaald
                        ? "💳 Klant heeft betaald — Klik op 'Bevestig Betaling' om te markeren"
                        : "⏳ Wacht op betaling van klant..."
                  }
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-4xl font-bold">
              Afgerond ({afgerond.length})
            </h2>
            <div className="space-y-5">
              {afgerond.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  footer="✅ Betaald bevestigd — Klant kan auto ophalen"
                />
              ))}
            </div>
          </section>
        </div>
      </main>

      <AssignMechanic
        open={isAssignOpen}
        appointment={selectedAppointment}
        mechanics={mechanics}
        selectedMechanic={selectedMechanic}
        onChangeMechanic={setSelectedMechanic}
        onClose={closeAssign}
        onAssign={handleAssignMechanic}
      />
    </div>
  );
}
