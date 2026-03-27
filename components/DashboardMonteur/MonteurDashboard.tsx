"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, CheckCircle2, CircleUserRound, LogOut, Wrench } from "lucide-react";
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
		status === "ready" ||
		status === "klaar" ||
		status === "afgerond"
	)
		return "klaar";
	if (
		status === "ingepland" ||
		status === "bevestigd" ||
		status === "confirmed" ||
		status === "in_afwachting"
	)
		return "toegewezen";
	return "toegewezen";
};

const STATUS_LABEL: Record<MonteurAppointment["status"], string> = {
	toegewezen: "Toegewezen",
	bezig: "Bezig",
	klaar: "Klaar",
};

const STATUS_COLORS: Record<MonteurAppointment["status"], string> = {
	toegewezen: "bg-blue-100 text-blue-700",
	bezig: "bg-purple-100 text-purple-700",
	klaar: "bg-green-100 text-green-700",
};

type AppointmentCardProps = {
	appointment: MonteurAppointment;
	action?: React.ReactNode;
};

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
						<span className="font-semibold text-slate-700">Klant:</span> {appointment.klant}
					</p>
					{appointment.dienst && (
						<p className="mt-1 text-xl text-slate-600">
							<span className="font-semibold text-slate-700">Dienst:</span> {appointment.dienst}
						</p>
					)}
				</div>

				<div className="min-w-[260px] text-xl text-slate-600">
					{appointment.datum && (
						<p>
							<span className="font-semibold text-slate-700">Datum:</span> {appointment.datum}
						</p>
					)}
				</div>
			</div>

			{appointment.opmerkingen && (
				<div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-lg text-amber-800">
					<span className="font-semibold">Klant opmerkingen:</span> {appointment.opmerkingen}
				</div>
			)}

			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}

export default function MonteurDashboard() {
	const router = useRouter();
	const [appointments, setAppointments] = useState<MonteurAppointment[]>([]);
	const [profileName, setProfileName] = useState("Monteur");
	const [loading, setLoading] = useState(true);
	const [errorText, setErrorText] = useState("");
	const [selectedAppointment, setSelectedAppointment] = useState<MonteurAppointment | null>(null);
	const [isMonteur, setIsMonteur] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setErrorText("");

			const { data: authData } = await supabase.auth.getUser();
			const authUser = authData.user;
			setCurrentUser(authUser);

			let monteurId: number | null = null;
			let monteurNaam = "Monteur";

			if (authUser?.email) {
				const { data: userRow, error: userError } = await supabase
					.from("users")
					.select("id, naam, rol")
					.eq("email", authUser.email)
					.single();

				if (!userError && userRow) {
					const row = userRow as { id: number; naam: string | null; rol: string | null };
					if (row.rol?.toLowerCase() === "monteur") {
						setIsMonteur(true);
						monteurId = row.id;
						monteurNaam = row.naam ?? authUser.email.split("@")[0];
					}
				}
			}

			setProfileName(monteurNaam);

			if (!authUser || !monteurId) {
				setAppointments([]);
				setLoading(false);
				return;
			}

			const { data: appointmentRows, error: apptError } = await supabase
				.from("appointments")
				.select("id, datum, status, opmerkingen, voertuig, merk, user_id, toegewezen_monteur, telefoonnummer")
				.eq("toegewezen_monteur", monteurId)
				.order("datum", { ascending: true });

			if (apptError) {
				setErrorText(`Afspraken laden mislukt: ${apptError.message}`);
				setLoading(false);
				return;
			}

			const userIds = [
				...new Set(
					(appointmentRows ?? [])
						.map((a: { user_id: number | null }) => a.user_id)
						.filter((id): id is number => id !== null),
				),
			];

			const klantById = new Map<number, string>();
			if (userIds.length > 0) {
				const { data: klantRows } = await supabase.from("users").select("id, naam, email").in("id", userIds);
				for (const k of klantRows ?? []) {
					const row = k as { id: number; naam: string | null; email: string | null };
					klantById.set(row.id, row.naam ?? row.email ?? `Klant #${row.id}`);
				}
			}

			const apptIds = (appointmentRows ?? []).map((a: { id: number }) => a.id);
			const dienstById = new Map<number, string>();
			if (apptIds.length > 0) {
				const { data: repairRows } = await supabase
					.from("repairs")
					.select("appointment_id, beschrijving")
					.in("appointment_id", apptIds);

				for (const r of repairRows ?? []) {
					const row = r as { appointment_id: number; beschrijving: string | null };
					if (!dienstById.has(row.appointment_id) && row.beschrijving) {
						const parts = row.beschrijving.split("|").map((part) => part.trim());
						dienstById.set(row.appointment_id, parts[0] || row.beschrijving);
					}
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
				};

				return {
					id: r.id,
					voertuig: toVehicleLabel(r),
					klant: r.user_id ? (klantById.get(r.user_id) ?? `Klant #${r.user_id}`) : "Onbekend",
					dienst: dienstById.get(r.id),
					datum: toDateLabel(r.datum),
					opmerkingen: r.opmerkingen ?? undefined,
					status: normalizeStatus(r.status),
				};
			});

			setAppointments(mapped);
			setLoading(false);
		};

		void loadData();
	}, []);

	const assignedAppointments = useMemo(
		() => appointments.filter((appointment) => appointment.status === "toegewezen"),
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

	const handleStartWerkzaamheden = async (id: number) => {
		if (!isMonteur) {
			setErrorText("Alleen monteurs kunnen werkzaamheden starten.");
			return;
		}

		// Different deployments/DBs might store the in-progress status differently.
		// Try the common variants before failing.
		const statusCandidates = ["in behandeling", "in_behandeling", "in_progress"];
		let lastError: string | null = null;

		for (const statusValue of statusCandidates) {
			const { error } = await supabase.from("appointments").update({ status: statusValue }).eq("id", id);
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

		setAppointments((prev) => prev.map((appointment) => (appointment.id === id ? { ...appointment, status: "bezig" } : appointment)));
	};

	const openModal = (appointment: MonteurAppointment) => {
		if (!isMonteur) {
			setErrorText("Alleen monteurs kunnen werkzaamheden registreren.");
			return;
		}

		setSelectedAppointment(appointment);
	};

	const closeModal = () => {
		setSelectedAppointment(null);
	};

	const handleCompleted = (appointmentId: number) => {
		setAppointments((prev) =>
			prev.map((appointment) =>
				appointment.id === appointmentId ? { ...appointment, status: "klaar" } : appointment,
			),
		);
		closeModal();
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/");
	};

	return (
		<div className="min-h-screen bg-slate-100 text-slate-900">
			<header className="border-b border-slate-200 bg-white px-8 py-4">
				<div className="mx-auto flex w-full max-w-[1250px] items-center justify-between">
					<div className="flex items-center gap-3">
						<Car className="text-blue-600" />
						<span className="text-[38px] font-bold">AutoGarage Pro</span>
					</div>

					<div className="flex items-center gap-6 text-xl">
						<Link
							href="/dashboard"
							className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 hover:bg-slate-100"
						>
							Terug naar Dashboard
						</Link>
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

			<main className="mx-auto max-w-[1250px] px-8 py-10">
				<h1 className="text-5xl font-bold">Monteur Dashboard</h1>
				<p className="mt-3 text-2xl text-slate-600">Uw toegewezen afspraken en werkzaamheden</p>

				{loading && <p className="mt-6 text-lg text-slate-600">Data laden...</p>}
				{errorText && <p className="mt-6 text-lg text-red-600">{errorText}</p>}

				{!loading && !currentUser && (
					<div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
						<CheckCircle2 size={48} className="mx-auto mb-4 text-blue-500" />
						<p className="text-2xl font-semibold text-slate-700">Je bent niet ingelogd</p>
						<p className="mt-2 text-lg text-slate-500">Log in als monteur om je toegewezen afspraken te zien.</p>
					</div>
				)}

				{!loading && currentUser && isMonteur && (
					<div className="mt-10 space-y-10">
						<section>
							<h2 className="mb-4 text-4xl font-bold">Toegewezen ({assignedAppointments.length})</h2>
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
							<h2 className="mb-4 text-4xl font-bold">In Behandeling ({inProgressAppointments.length})</h2>
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
							<h2 className="mb-4 text-4xl font-bold">Afgerond ({completedAppointments.length})</h2>
							<div className="space-y-5">
								{completedAppointments.map((appointment) => (
									<MonteurAppointmentCard key={appointment.id} appointment={appointment} />
								))}
							</div>
						</section>

						{assignedAppointments.length === 0 &&
							inProgressAppointments.length === 0 &&
							completedAppointments.length === 0 &&
							!errorText && (
								<div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
									<CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
									<p className="text-2xl font-semibold text-slate-700">Geen werkzaamheden gevonden</p>
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
