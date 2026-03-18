"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const UURTARIEF = 75;

const STANDAARD_HANDELINGEN = [
	"Olie vervangen",
	"Remblokken vervangen",
	"Banden wisselen",
	"Airco service",
	"APK keuring",
	"Accu vervangen",
	"Distributieriem vervangen",
	"Remschijven vervangen",
	"Vloeistoffen controleren",
	"Filters vervangen",
];

type Material = {
	id: number;
	naam: string;
	prijs: number;
};

type SelectedMaterial = {
	material: Material;
	hoeveelheid: number;
};

type WerkzaamhedenModalProps = {
	open: boolean;
	appointmentId: number | null;
	voertuig: string;
	isMonteur: boolean;
	onClose: () => void;
	onCompleted: (appointmentId: number) => void;
};

export default function WerkzaamhedenModal({
	open,
	appointmentId,
	voertuig,
	isMonteur,
	onClose,
	onCompleted,
}: WerkzaamhedenModalProps) {
	const [materials, setMaterials] = useState<Material[]>([]);
	const [selectedHandelingen, setSelectedHandelingen] = useState<string[]>([]);
	const [selectedMaterials, setSelectedMaterials] = useState<SelectedMaterial[]>([]);
	const [uren, setUren] = useState(1);
	const [opmerkingen, setOpmerkingen] = useState("");
	const [saving, setSaving] = useState(false);
	const [errorText, setErrorText] = useState("");

	useEffect(() => {
		if (!open) return;
		setSelectedHandelingen([]);
		setSelectedMaterials([]);
		setUren(1);
		setOpmerkingen("");
		setErrorText("");

		void supabase
			.from("materials")
			.select("id, naam, prijs")
			.then(({ data }) => {
				setMaterials((data ?? []) as Material[]);
			});
	}, [open]);

	if (!open || appointmentId === null) return null;

	const toggleHandeling = (handeling: string) => {
		setSelectedHandelingen((prev) =>
			prev.includes(handeling) ? prev.filter((h) => h !== handeling) : [...prev, handeling],
		);
	};

	const toggleMaterial = (material: Material) => {
		setSelectedMaterials((prev) => {
			const exists = prev.find((m) => m.material.id === material.id);
			if (exists) return prev.filter((m) => m.material.id !== material.id);
			return [...prev, { material, hoeveelheid: 1 }];
		});
	};

	const updateHoeveelheid = (materialId: number, hoeveelheid: number) => {
		setSelectedMaterials((prev) =>
			prev.map((m) => (m.material.id === materialId ? { ...m, hoeveelheid: Math.max(1, hoeveelheid) } : m)),
		);
	};

	const arbeidskosten = uren * UURTARIEF;
	const materiaalkosten = selectedMaterials.reduce((sum, m) => sum + m.material.prijs * m.hoeveelheid, 0);
	const totaal = arbeidskosten + materiaalkosten;

	const handleSave = async () => {
		if (!isMonteur) {
			setErrorText("Alleen monteurs kunnen werkzaamheden registreren.");
			return;
		}
		setSaving(true);
		setErrorText("");

		try {
			const beschrijving =
				[...selectedHandelingen, opmerkingen ? `Opmerkingen: ${opmerkingen}` : ""]
					.filter(Boolean)
					.join(", ") || opmerkingen || "Werkzaamheden uitgevoerd";

			// Insert repair
			const { data: repairData, error: repairError } = await supabase
				.from("repairs")
				.insert({
					appointment_id: appointmentId,
					beschrijving,
					uren,
					kosten: totaal,
				})
				.select("id")
				.single();

			if (repairError) throw new Error(`Reparatie opslaan mislukt: ${repairError.message}`);

			const repairId = (repairData as { id: number }).id;

			// Insert repair_materials
			if (selectedMaterials.length > 0) {
				const materialRows = selectedMaterials.map((m) => ({
					repair_id: repairId,
					material_id: m.material.id,
					hoeveelheid: m.hoeveelheid,
				}));
				const { error: matError } = await supabase.from("repair_materials").insert(materialRows);
				if (matError) throw new Error(`Materialen opslaan mislukt: ${matError.message}`);
			}

			// Upsert invoice
			const { error: invoiceError } = await supabase.from("invoices").upsert(
				{ appointment_id: appointmentId, totaalbedrag: totaal, betaald: "nee" },
				{ onConflict: "appointment_id" },
			);
			if (invoiceError) throw new Error(`Factuur opslaan mislukt: ${invoiceError.message}`);

			// Update appointment status (leave as in_progress since there's no "completed" status in enum)
			// The completion is indicated by the presence of repair and invoice records
			// const { error: statusError } = await supabase
			// 	.from("appointments")
			// 	.update({ status: "ready_for_pickup" })
			// 	.eq("id", appointmentId);
			// if (statusError) throw new Error(`Status bijwerken mislukt: ${statusError.message}`);

			onCompleted(appointmentId);
		} catch (err) {
			setErrorText(err instanceof Error ? err.message : "Er is een fout opgetreden");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
			<div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
				>
					<X size={24} />
				</button>

				<h2 className="text-3xl font-bold text-slate-900">Werkzaamheden Registreren</h2>
				<p className="mt-1 text-lg text-blue-600">{voertuig}</p>

				{errorText && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-red-600">{errorText}</p>}

				{/* Two columns */}
				<div className="mt-6 grid grid-cols-2 gap-6">
					{/* Standaard Handelingen */}
					<div>
						<h3 className="mb-3 text-xl font-bold text-slate-800">Standaard Handelingen</h3>
						<div className="space-y-2">
							{STANDAARD_HANDELINGEN.map((handeling) => (
								<label key={handeling} className="flex cursor-pointer items-center gap-3">
									<input
										type="checkbox"
										checked={selectedHandelingen.includes(handeling)}
										onChange={() => toggleHandeling(handeling)}
										className="h-4 w-4 rounded border-slate-300 accent-purple-600"
									/>
									<span className="text-base text-slate-700">{handeling}</span>
								</label>
							))}
						</div>
					</div>

					{/* Materialen */}
					<div>
						<h3 className="mb-3 text-xl font-bold text-slate-800">Materialen / Onderdelen</h3>
						{materials.length === 0 ? (
							<p className="text-base text-slate-500">Geen materialen beschikbaar</p>
						) : (
							<div className="space-y-2">
								{materials.map((material) => {
									const selected = selectedMaterials.find((m) => m.material.id === material.id);
									return (
										<div key={material.id} className="flex items-center gap-3">
											<input
												type="checkbox"
												checked={!!selected}
												onChange={() => toggleMaterial(material)}
												className="h-4 w-4 rounded border-slate-300 accent-purple-600"
											/>
											<span className="flex-1 text-base text-slate-700">
												{material.naam}{" "}
												<span className="text-slate-400">(€{material.prijs.toFixed(2)})</span>
											</span>
											{selected && (
												<input
													type="number"
													min={1}
													value={selected.hoeveelheid}
													onChange={(e) => updateHoeveelheid(material.id, Number(e.target.value))}
													className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm"
												/>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>

				{/* Geselecteerde Werkzaamheden */}
				<div className="mt-6">
					<h3 className="mb-2 text-xl font-bold text-slate-800">Geselecteerde Werkzaamheden</h3>
					{selectedHandelingen.length === 0 && selectedMaterials.length === 0 ? (
						<p className="text-center text-base text-slate-400">Geen werkzaamheden geselecteerd</p>
					) : (
						<ul className="space-y-1 text-base text-slate-700">
							{selectedHandelingen.map((h) => (
								<li key={h} className="flex items-center gap-2">
									<CheckCircle2 size={16} className="text-green-500" />
									{h}
								</li>
							))}
							{selectedMaterials.map((m) => (
								<li key={m.material.id} className="flex items-center gap-2">
									<CheckCircle2 size={16} className="text-blue-500" />
									{m.material.naam} × {m.hoeveelheid} = €{(m.material.prijs * m.hoeveelheid).toFixed(2)}
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Gewerkte Uren */}
				<div className="mt-6">
					<label className="mb-2 block text-xl font-bold text-slate-800">Gewerkte Uren</label>
					<div className="flex items-center gap-3">
						<input
							type="number"
							min={0.5}
							step={0.5}
							value={uren}
							onChange={(e) => setUren(Math.max(0.5, Number(e.target.value)))}
							className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-lg"
						/>
						<span className="text-base text-slate-600">
							uur × €{UURTARIEF}/uur = €{arbeidskosten.toFixed(2)}
						</span>
					</div>
				</div>

				{/* Opmerkingen */}
				<div className="mt-6">
					<label className="mb-2 block text-xl font-bold text-slate-800">Opmerkingen voor Klant</label>
					<textarea
						value={opmerkingen}
						onChange={(e) => setOpmerkingen(e.target.value)}
						rows={4}
						placeholder="Bijv: Remblokken vervangen. Banden zijn bijna versleten, adviseren binnen 3 maanden te vervangen."
						className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
					/>
				</div>

				{/* Totaal */}
				<div className="mt-6 flex items-center justify-between rounded-xl bg-slate-100 px-6 py-4">
					<span className="text-2xl font-bold text-slate-900">Totaal</span>
					<span className="text-2xl font-bold text-blue-600">€{totaal.toFixed(2)}</span>
				</div>

				{/* Buttons */}
				<div className="mt-6 grid grid-cols-2 gap-4">
					<button
						type="button"
						onClick={onClose}
						disabled={saving}
						className="rounded-xl border border-slate-300 py-3 text-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
					>
						Annuleren
					</button>
					<button
						type="button"
						onClick={handleSave}
						disabled={saving}
						className="rounded-xl bg-green-500 py-3 text-lg font-medium text-white hover:bg-green-600 disabled:opacity-50"
					>
						{saving ? "Opslaan..." : "Voltooien & Opslaan"}
					</button>
				</div>
			</div>
		</div>
	);
}
