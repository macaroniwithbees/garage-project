import type { ReactNode } from "react";
import StatusBadge from "./StatusBadge";
import type { ReceptionistAppointment } from "./types";

type AppointmentCardProps = {
	appointment: ReceptionistAppointment;
	action?: ReactNode;
	footer?: ReactNode;
};

export default function AppointmentCard({ appointment, action, footer }: AppointmentCardProps) {
	return (
		<div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
			<div className="flex flex-wrap items-start justify-between gap-6">
				<div>
					<div className="mb-2 flex flex-wrap items-center gap-3">
						<h3 className="text-[34px] leading-none font-bold text-slate-900 sm:text-3xl md:text-[34px]">
							{appointment.voertuig}
						</h3>
						<StatusBadge status={appointment.status} />
					</div>
					<p className="text-xl text-slate-600">
						<span className="font-semibold text-slate-700">Klant:</span> {appointment.klant}
					</p>
					{appointment.dienst && (
						<p className="mt-1 text-xl text-slate-600">
							<span className="font-semibold text-slate-700">Dienst:</span> {appointment.dienst}
						</p>
					)}
					{typeof appointment.betaald === "boolean" && (
						<p className="mt-1 text-xl text-slate-600">
							<span className="font-semibold text-slate-700">Betaald:</span>{" "}
							{appointment.betaald ? "Ja" : "Nee"}
						</p>
					)}
				</div>

				<div className="min-w-[260px] text-xl text-slate-600">
					{appointment.telefoon && (
						<p>
							<span className="font-semibold text-slate-700">Telefoon:</span> {appointment.telefoon}
						</p>
					)}
					{appointment.datum && (
						<p className="mt-2">
							<span className="font-semibold text-slate-700">Datum:</span> {appointment.datum}
						</p>
					)}
					<p className="mt-2">
						<span className="font-semibold text-slate-700">Monteur:</span> {appointment.monteur ?? ""}
					</p>
				</div>
			</div>

			{appointment.opmerkingen && (
				<div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-lg text-slate-600">
					<span className="font-semibold text-slate-700">Klant opmerkingen:</span> {appointment.opmerkingen}
				</div>
			)}

			{action && <div className="mt-4">{action}</div>}
			{footer && <div className="mt-5 text-center text-2xl text-slate-600">{footer}</div>}
		</div>
	);
}