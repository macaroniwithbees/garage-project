import type { AppointmentStatus } from "./types";

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
	const config = {
		in_afwachting: {
			label: "In afwachting",
			className: "bg-amber-100 text-amber-700",
		},
		bevestigd: {
			label: "Bevestigd",
			className: "bg-blue-100 text-blue-700",
		},
		in_behandeling: {
			label: "In behandeling",
			className: "bg-purple-100 text-purple-700",
		},
		klaar_voor_ophalen: {
			label: "Klaar voor ophalen",
			className: "bg-indigo-100 text-indigo-700",
		},
	} as const;

	return (
		<span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${config[status].className}`}>
			{config[status].label}
		</span>
	);
}