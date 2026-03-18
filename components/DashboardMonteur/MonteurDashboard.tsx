"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Wrench, LogOut, CircleUserRound, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import WerkzaamhedenModal from "./WerkzaamhedenModal";

type MonteurAppointment = {
	id: number;
	voertuig: string;
	klant: string;
	dienst?: string;
	datum?: string;
	opmerkingen?: string;
	status: "toegewezen" | "bezig" | "klaar";
};

const toDateLabel = (dateValue: string | null): string | undefined => {
	if (!dateValue) return undefined;
	return new Date(dateValue).toLocaleDateString("nl-NL");
};

const toVehicleLabel = (row: {
	voertuig?: string | null;
	merk?: string | null;
	id: number;
}): string => {
	if (row.voertuig) return row.voertuig;
	if (row.merk) return row.merk;
	return `Voertuig #${row.id}`;
};

const normalizeStatus = (status: string | null): MonteurAppointment["status"] => {
	if (status === "in behandeling" || status === "in_behandeling" || status === "in_progress") return "bezig";
	if (
		status === "klaar_voor_ophalen" ||
		status === "ready_for_pickup" ||
		status === "completed" ||
		status === "ready"
	) 
		return "klaar";
	if (status === "ingepland" || status === "bevestigd" || status === "confirmed" || status === "in_afwachting") return "toegewezen";
	return "toegewezen";
};

const STATUS_LABEL: Record<MonteurAppointment["status"], string> = {
	toegewezen: "Toegewezen",
	bezig: "Bezig",
	klaar: "Klaar",
};

const STATUS_COLORS: Record<MonteurAppointment["status"], string> = {
	toegewezen: "bg-purple-100 text-purple-700",
	bezig: "bg-yellow-100 text-yellow-700",
	klaar: "bg-green-100 text-green-700",
};

export default function MonteurDashboard() {
	const router = useRouter();
	const [appointments, setAppointments] = useState<MonteurAppointment[]>([]);
	const [profileName, setProfileName] = useState("Monteur");
	const [loading, setLoading] = useState(true);
	const [errorText, setErrorText] = useState("");

	// Modal state
	const [modalOpen, setModalOpen] = useState(false);
	const [selectedAppointment, setSelectedAppointment] = useState<MonteurAppointment | null>(null);
	const [isMonteur, setIsMonteur] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setErrorText("");

			const { data: authData } = await supabase.auth.getUser();
			const currentUser = authData.user;
			setCurrentUser(currentUser);

			let monteurId: number | null = null;
			let monteurNaam = "Monteur";

			if (currentUser?.email) {
				// Get the user record from our users table
				const { data: userRow, error: userError } = await supabase
					.from("users")
					.select("id, naam, rol")
					.eq("email", currentUser.email)
					.single();

				if (!userError && userRow) {
					const row = userRow as { id: number; naam: string | null; rol: string | null };
					if (row.rol?.toLowerCase() === "monteur") {
						setIsMonteur(true);
						monteurId = row.id;
						monteurNaam = row.naam ?? currentUser.email.split("@")[0];
					}
				}
			}

			setProfileName(monteurNaam);

			// Load appointments assigned to mechanics (all if not logged in as mechanic, only own if logged in)
			// We fetch all relevant appointments and normalize status values, as the stored status strings can vary.
			let query = supabase
				.from("appointments")
				.select("id, datum, status, opmerkingen, voertuig, merk, user_id, toegewezen_monteur, telefoonnummer")
				.order("datum", { ascending: true });

			if (monteurId) {
				query = query.eq("toegewezen_monteur", monteurId);
			} else {
				query = query.not("toegewezen_monteur", "is", null);
			}

			const { data: appointmentRows, error: apptError } = await query;

			if (apptError) {
				setErrorText(`Afspraken laden mislukt: ${apptError.message}`);
				setLoading(false);
				return;
			}

			// Get customer names
			const userIds = [
				...new Set(
					(appointmentRows ?? [])
						.map((a: { user_id: number | null }) => a.user_id)
						.filter((id): id is number => id !== null),
				),
			];

			const klantById = new Map<number, string>();
			if (userIds.length > 0) {
				const { data: klantRows } = await supabase
					.from("users")
					.select("id, naam, email")
					.in("id", userIds);
				for (const k of klantRows ?? []) {
					const row = k as { id: number; naam: string | null; email: string | null; telefoon: number | null };
					klantById.set(row.id, row.naam ?? row.email ?? `Klant #${row.id}`);
				}
			}

			// Get services from repairs table and check completion status from invoices
			const apptIds = (appointmentRows ?? []).map((a: { id: number }) => a.id);
			const dienstById = new Map<number, string>();
			const completedById = new Set<number>();
			if (apptIds.length > 0) {
				const { data: repairRows } = await supabase
					.from("repairs")
					.select("appointment_id, beschrijving")
					.in("appointment_id", apptIds);
				for (const r of repairRows ?? []) {
					const row = r as { appointment_id: number; beschrijving: string | null };
					if (!dienstById.has(row.appointment_id) && row.beschrijving) {
						const parts = row.beschrijving.split("|").map((p) => p.trim());
						dienstById.set(row.appointment_id, parts[0] || row.beschrijving);
					}
					// If there's a repair record, consider it completed
					completedById.add(row.appointment_id);
				}
			}

			const mapped: MonteurAppointment[] = (appointmentRows ?? []).map((row) => {
				const r = row as {
					id: number;
					datum: string | null;
					status: string | null;
					opmerkingen: string | null;
					voertuig: string | null;
					merk: string | null;
					user_id: number | null;
					telefoonnummer: string | null;
				};
				const isCompleted = completedById.has(r.id);
				return {
					id: r.id,
					voertuig: toVehicleLabel(r),
					klant: r.user_id ? (klantById.get(r.user_id) ?? `Klant #${r.user_id}`) : "Onbekend",
					dienst: dienstById.get(r.id),
					datum: toDateLabel(r.datum),
					opmerkingen: r.opmerkingen ?? undefined,
					status: isCompleted ? "klaar" : normalizeStatus(r.status),
				};
			});

			setAppointments(mapped);
			setLoading(false);
		};

		void loadData();
	}, []);

	const handleStartWerkzaamheden = async (id: number) => {
		if (!isMonteur) {
			setErrorText("Alleen monteurs kunnen werkzaamheden starten.");
			return;
		}
		const { error } = await supabase
			.from("appointments")
			.update({ status: "in behandeling" })
			.eq("id", id);

		if (error) {
			setErrorText(`Status bijwerken mislukt: ${error.message}`);
			return;
		}

		setAppointments((prev) =>
			prev.map((a) => (a.id === id ? { ...a, status: "bezig" } : a)),
		);
	};

	const openModal = (appointment: MonteurAppointment) => {
		if (!isMonteur) {
			setErrorText("Alleen monteurs kunnen werkzaamheden registreren.");
			return;
		}
		setSelectedAppointment(appointment);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setSelectedAppointment(null);
	};

	const handleCompleted = (appointmentId: number) => {
		setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
		closeModal();
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/");
	};

	const active = appointments.filter((a) => a.status === "bezig" || a.status === "toegewezen");

	return (
		<div className="min-h-screen bg-slate-100 text-slate-900">
			{/* Navbar */}
			<header className="border-b border-slate-200 bg-white px-8 py-4">
				<div className="mx-auto flex w-full max-w-[1250px] items-center justify-between">
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

			{/* Main */}
			<main className="mx-auto max-w-[1250px] px-8 py-10">
				<h1 className="text-5xl font-bold">Monteur Dashboard</h1>
				<p className="mt-3 text-2xl text-slate-600">Uw toegewezen afspraken en werkzaamheden</p>

				{loading && <p className="mt-6 text-lg text-slate-600">Data laden...</p>}
				{errorText && <p className="mt-6 text-lg text-red-600">{errorText}</p>}

{!loading && !currentUser && (
				<div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
					<CheckCircle2 size={48} className="mx-auto mb-4 text-blue-500" />
					<p className="text-2xl font-semibold text-slate-700">Je bent niet ingelogd</p>
					<p className="mt-2 text-lg text-slate-500">
						Log in als monteur om je toegewezen afspraken te zien.
					</p>
				</div>
			)}

			{!loading && currentUser && active.length === 0 && !errorText && (
					<div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
						<CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
						<p className="text-2xl font-semibold text-slate-700">Geen openstaande werkzaamheden</p>
						<p className="mt-2 text-lg text-slate-500">Alle afspraken zijn afgerond of er zijn nog geen afspraken toegewezen.</p>
					</div>
				)}

				<div className="mt-10 space-y-6">
					{active.map((appointment) => (
						<div
							key={appointment.id}
							className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
						>
							{/* Card header */}
							<div className="flex flex-wrap items-center gap-3">
								<h3 className="text-[28px] font-bold text-slate-900">{appointment.voertuig}</h3>
								<span
									className={`rounded-full px-3 py-1 text-base font-medium ${STATUS_COLORS[appointment.status]}`}
								>
									{STATUS_LABEL[appointment.status]}
								</span>
							</div>

							{/* Card body */}
							<div className="mt-3 grid grid-cols-2 gap-x-6 text-xl text-slate-600">
								<p>
									<span className="font-semibold text-slate-700">Klant:</span> {appointment.klant}
								</p>
								{appointment.dienst && (
									<p>
										<span className="font-semibold text-slate-700">Dienst:</span> {appointment.dienst}
									</p>
								)}
								{appointment.datum && (
									<p className="mt-1">
										<span className="font-semibold text-slate-700">Datum:</span> {appointment.datum}
									</p>
								)}
							</div>

							{/* Opmerkingen */}
							{appointment.opmerkingen && (
								<div className="mt-4 rounded-lg bg-yellow-50 px-4 py-3 text-lg text-slate-600">
									<span className="font-semibold text-yellow-700">Klant opmerkingen:</span>{" "}
									<span className="text-yellow-600">{appointment.opmerkingen}</span>
								</div>
							)}

							{/* Action button */}
							<div className="mt-4">
								{appointment.status === "toegewezen" && isMonteur && (
									<button
										type="button"
										onClick={() => handleStartWerkzaamheden(appointment.id)}
										className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-2xl font-medium text-white hover:bg-purple-700"
									>
										<Wrench size={24} />
										Start Werkzaamheden
									</button>
								)}
								{appointment.status === "bezig" && isMonteur && (
									<button
										type="button"
										onClick={() => openModal(appointment)}
										className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-2xl font-medium text-white hover:bg-green-700"
									>
										<CheckCircle2 size={24} />
										Werkzaamheden Registreren &amp; Voltooien
									</button>
								)}
								{!isMonteur && (
									<p className="text-center text-lg text-slate-500">
										Log in als monteur om werkzaamheden te starten
									</p>
								)}
							</div>
						</div>
					))}
				</div>
			</main>

			{/* Modal */}
			<WerkzaamhedenModal
				open={modalOpen}
				appointmentId={selectedAppointment?.id ?? null}
				voertuig={selectedAppointment?.voertuig ?? ""}
				isMonteur={isMonteur}
				onClose={closeModal}
				onCompleted={handleCompleted}
			/>
		</div>
	);
}
