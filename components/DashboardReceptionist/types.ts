export type AppointmentStatus = "in_afwachting" | "bevestigd" | "in_behandeling" | "klaar_voor_ophalen";

export type ReceptionistAppointment = {
	id: number;
	voertuig: string;
	klant: string;
	dienst?: string;
	telefoon?: string;
	datum?: string;
	opmerkingen?: string;
	monteur?: string;
	betaald?: boolean;
	status: AppointmentStatus;
};

export type AppointmentRow = {
	id: number;
	user_id: number | null;
	datum: string | null;
	status: string | null;
	toegewezen_monteur: number | null;
	voertuig?: string | null;
	kenteken?: string | null;
	merk?: string | null;
	model?: string | null;
	telefoon?: string | null;
	opmerkingen?: string | null;
};

export type UserRow = {
	id: number;
	naam: string | null;
	email: string | null;
	rol: string | null;
	telefoon?: string | null;
};

export type InvoiceRow = {
	appointment_id: number;
	betaald: string | null;
};

export type RepairRow = {
	appointment_id: number;
	beschrijving: string | null;
};

export type MechanicOption = {
	id: number;
	naam: string;
};