import type { MechanicOption, ReceptionistAppointment } from "./types";

type AssignMechanicProps = {
	open: boolean;
	appointment: ReceptionistAppointment | null;
	mechanics: MechanicOption[];
	selectedMechanic: string;
	onChangeMechanic: (value: string) => void;
	onClose: () => void;
	onAssign: () => void;
};

export default function AssignMechanic({
	open,
	appointment,
	mechanics,
	selectedMechanic,
	onChangeMechanic,
	onClose,
	onAssign,
}: AssignMechanicProps) {
	if (!open || !appointment) return null;

	return (
		<div className="mx-auto mt-8 w-full max-w-[1250px] rounded-3xl bg-white p-10 ring-1 ring-slate-200">
			<h3 className="text-4xl font-bold">Monteur Toewijzen</h3>
			<p className="mt-3 text-2xl text-slate-600">{appointment.voertuig}</p>

			<label htmlFor="monteur" className="mt-6 block text-2xl font-semibold">
				Selecteer monteur
			</label>
			<select
				id="monteur"
				className="mt-3 w-full rounded-2xl border border-slate-300 px-5 py-4 text-2xl outline-none focus:border-blue-500"
				value={selectedMechanic}
				onChange={(event) => onChangeMechanic(event.target.value)}
			>
				<option value="">Kies een monteur</option>
				{mechanics.map((mechanic) => (
					<option key={mechanic.id} value={String(mechanic.id)}>
						{mechanic.naam}
					</option>
				))}
			</select>

			<div className="mt-6 grid grid-cols-2 gap-4">
				<button
					type="button"
					onClick={onClose}
					className="rounded-2xl border border-slate-300 py-4 text-2xl font-medium"
				>
					Annuleren
				</button>
				<button
					type="button"
					onClick={onAssign}
					disabled={!selectedMechanic}
					className="rounded-2xl bg-blue-600 py-4 text-2xl font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
				>
					Toewijzen
				</button>
			</div>
		</div>
	);
}