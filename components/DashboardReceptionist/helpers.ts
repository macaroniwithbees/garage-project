import type { AppointmentRow, AppointmentStatus } from "./types";

export const normalizeStatus = (status: string | null | undefined): AppointmentStatus => {
	if (status === "bevestigd" || status === "confirmed") return "bevestigd";
	if (status === "in_behandeling" || status === "in_progress") return "in_behandeling";
	if (status === "klaar_voor_ophalen" || status === "ready_for_pickup") return "klaar_voor_ophalen";
	return "in_afwachting";
};

export const toDateLabel = (dateValue: string | null): string | undefined => {
	if (!dateValue) return undefined;
	return new Date(dateValue).toLocaleDateString("nl-NL");
};

export const toVehicleLabel = (appointment: AppointmentRow): string => {
	if (appointment.voertuig) return appointment.voertuig;

	const brandModel = [appointment.merk, appointment.model].filter(Boolean).join(" ").trim();
	if (brandModel && appointment.kenteken) return `${brandModel} - ${appointment.kenteken}`;
	if (brandModel) return brandModel;
	if (appointment.kenteken) return appointment.kenteken;

	return `Afspraak #${appointment.id}`;
};