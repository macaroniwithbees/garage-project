"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { createPortal } from "react-dom";

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
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
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
  if (typeof document === "undefined") return null;

  const toggleHandeling = (handeling: string) => {
    setSelectedHandelingen((prev) =>
      prev.includes(handeling)
        ? prev.filter((h) => h !== handeling)
        : [...prev, handeling],
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
      prev.map((m) =>
        m.material.id === materialId
          ? { ...m, hoeveelheid: Math.max(1, hoeveelheid) }
          : m,
      ),
    );
  };

  const arbeidskosten = uren * UURTARIEF;
  const materiaalkosten = selectedMaterials.reduce(
    (sum, m) => sum + m.material.prijs * m.hoeveelheid,
    0,
  );
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
        [
          ...selectedHandelingen,
          opmerkingen ? `Opmerkingen: ${opmerkingen}` : "",
        ]
          .filter(Boolean)
          .join(", ") ||
        opmerkingen ||
        "Werkzaamheden uitgevoerd";

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

      if (repairError)
        throw new Error(`Reparatie opslaan mislukt: ${repairError.message}`);

      const repairId = (repairData as { id: number }).id;

      // Insert repair_materials
      if (selectedMaterials.length > 0) {
        const materialRows = selectedMaterials.map((m) => ({
          repair_id: repairId,
          material_id: m.material.id,
          hoeveelheid: m.hoeveelheid,
        }));
        const { error: matError } = await supabase
          .from("repair_materials")
          .insert(materialRows);
        if (matError)
          throw new Error(`Materialen opslaan mislukt: ${matError.message}`);
      }

      // Upsert invoice
      const { error: invoiceError } = await supabase.from("invoices").upsert(
        {
          appointment_id: appointmentId,
          totaalbedrag: totaal,
          betaald: "nee",
        },
        { onConflict: "appointment_id" },
      );
      if (invoiceError)
        throw new Error(`Factuur opslaan mislukt: ${invoiceError.message}`);

      // Update appointment status.
      // Some DBs only allow "klaar" (enum). Receptionist dashboard will normalize "klaar" to "klaar_voor_ophalen".
      const statusCandidates = ["klaar_voor_ophalen"];
      let lastStatusError: string | null = null;

      for (const statusValue of statusCandidates) {
        const { error: statusError } = await supabase
          .from("appointments")
          .update({ status: statusValue })
          .eq("id", appointmentId);
        if (!statusError) {
          lastStatusError = null;
          break;
        }
        lastStatusError = statusError.message;
      }

      if (lastStatusError)
        throw new Error(`Status bijwerken mislukt: ${lastStatusError}`);

      onCompleted(appointmentId);
    } catch (err) {
      setErrorText(
        err instanceof Error ? err.message : "Er is een fout opgetreden",
      );
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(100, 116, 139, 0.5)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 10,
            color: "#334155",
          }}
          className="hover:text-slate-900"
        >
          <X size={22} />
        </button>
        <div className="relative shrink-0 px-6 pt-5">
          <h2 className="text-2xl font-bold" style={{ color: "#0f172a" }}>
            Werkzaamheden Registreren
          </h2>
          <p className="text-sm" style={{ color: "#2563eb" }}>
            {voertuig}
          </p>

          {errorText && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {errorText}
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
          {/* Two columns */}
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Standaard Handelingen */}
            <div>
              <h3
                className="mb-2 text-base font-bold"
                style={{ color: "#0f172a" }}
              >
                Standaard Handelingen
              </h3>
              <div className="space-y-1">
                {STANDAARD_HANDELINGEN.map((handeling) => (
                  <label
                    key={handeling}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHandelingen.includes(handeling)}
                      onChange={() => toggleHandeling(handeling)}
                      className="h-3.5 w-3.5 rounded border-slate-300 accent-purple-600"
                    />
                    <span className="text-sm text-slate-700">{handeling}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Materialen */}
            <div>
              <h3
                className="mb-2 text-base font-bold"
                style={{ color: "#0f172a" }}
              >
                Materialen / Onderdelen
              </h3>
              {materials.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Geen materialen beschikbaar
                </p>
              ) : (
                <div className="space-y-2">
                  {materials.map((material) => {
                    const selected = selectedMaterials.find(
                      (m) => m.material.id === material.id,
                    );
                    return (
                      <div
                        key={material.id}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={() => toggleMaterial(material)}
                          className="h-4 w-4 rounded border-slate-300 accent-purple-600"
                        />
                        <span className="flex-1 text-base text-slate-700">
                          {material.naam}{" "}
                          <span className="text-slate-400">
                            (€{material.prijs.toFixed(2)})
                          </span>
                        </span>
                        {selected && (
                          <input
                            type="number"
                            min={1}
                            value={selected.hoeveelheid}
                            onChange={(e) =>
                              updateHoeveelheid(
                                material.id,
                                Number(e.target.value),
                              )
                            }
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
          <div className="mt-5">
            <h3
              className="mb-2 text-base font-bold"
              style={{ color: "#0f172a" }}
            >
              Geselecteerde Werkzaamheden
            </h3>

            {selectedHandelingen.length === 0 &&
            selectedMaterials.length === 0 ? (
              <p className="text-center text-base text-slate-400">
                Geen werkzaamheden geselecteerd
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px 16px",
                }}
              >
                {/* Handelingen */}
                {selectedHandelingen.map((h) => (
                  <div
                    key={h}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: 0,
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      style={{ color: "#22c55e", flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#334155",
                        wordBreak: "break-word",
                      }}
                    >
                      {h}
                    </span>
                  </div>
                ))}

                {/* Materialen */}
                {selectedMaterials.map((m) => (
                  <div
                    key={m.material.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <CheckCircle2
                        size={16}
                        style={{ color: "#3b82f6", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#1e293b",
                          wordBreak: "break-word",
                        }}
                      >
                        {m.material.naam}
                      </span>
                    </div>

                    <div
                      style={{
                        marginLeft: "24px",
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      {m.hoeveelheid} × €{m.material.prijs.toFixed(2)}
                    </div>

                    <div
                      style={{
                        marginLeft: "24px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      €{(m.material.prijs * m.hoeveelheid).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gewerkte Uren */}
          <div className="mt-4">
            <label
              className="mb-1 block text-base font-bold"
              style={{ color: "#0f172a" }}
            >
              Gewerkte Uren
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={uren}
                onChange={(e) => setUren(Math.max(0.5, Number(e.target.value)))}
                style={{
                  width: "80px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  padding: "6px 10px",
                  fontSize: "16px",
                  color: "#0f172a",
                  textAlign: "center",
                }}
              />
              <span className="text-sm text-slate-600">
                uur × €{UURTARIEF}/uur = €{arbeidskosten.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Opmerkingen */}
          <div className="mt-4">
            <label
              className="mb-1 block text-base font-bold"
              style={{ color: "#0f172a" }}
            >
              Opmerkingen voor Klant
            </label>
            <textarea
              value={opmerkingen}
              onChange={(e) => setOpmerkingen(e.target.value)}
              rows={2}
              placeholder="Bijv: Remblokken vervangen. Banden zijn bijna versleten, adviseren binnen 3 maanden te vervangen."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Totaal */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-100 px-4 py-3">
            <span className="text-lg font-bold" style={{ color: "#0f172a" }}>
              Totaal
            </span>
            <span className="text-lg font-bold" style={{ color: "#2563eb" }}>
              €{totaal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            padding: "16px 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                padding: "10px",
                fontSize: "1rem",
                fontWeight: 500,
                color: "#0f172a",
                backgroundColor: "#ffffff",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                borderRadius: "12px",
                border: "none",
                padding: "10px",
                fontSize: "1rem",
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: saving ? "#86efac" : "#22c55e",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.8 : 1,
              }}
            >
              {saving ? "Opslaan..." : "Voltooien & Opslaan"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
