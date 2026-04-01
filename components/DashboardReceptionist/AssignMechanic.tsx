"use client";

import { createPortal } from "react-dom";
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
  if (typeof document === "undefined") return null;

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
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: "768px",
          borderRadius: "24px",
          backgroundColor: "#ffffff",
          padding: "40px",
          color: "#0f172a",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 style={{ fontSize: "2.25rem", fontWeight: 700, color: "#0f172a" }}>
          Monteur Toewijzen
        </h3>
        <p style={{ marginTop: "12px", fontSize: "1.5rem", color: "#475569" }}>
          {appointment.voertuig}
        </p>

        <label
          htmlFor="monteur"
          style={{
            display: "block",
            marginTop: "24px",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          Selecteer monteur
        </label>
        <select
          id="monteur"
          style={{
            marginTop: "12px",
            width: "100%",
            borderRadius: "16px",
            border: "1px solid #cbd5e1",
            padding: "16px 20px",
            fontSize: "1.5rem",
            color: "#0f172a",
            outline: "none",
            backgroundColor: "#ffffff",
          }}
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

        <div
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              borderRadius: "16px",
              border: "1px solid #cbd5e1",
              padding: "16px",
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "#0f172a",
              backgroundColor: "#ffffff",
              cursor: "pointer",
            }}
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={onAssign}
            disabled={!selectedMechanic}
            style={{
              borderRadius: "16px",
              border: "none",
              padding: "16px",
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "#ffffff",
              backgroundColor: selectedMechanic ? "#2563eb" : "#93b4f8",
              cursor: selectedMechanic ? "pointer" : "not-allowed",
              opacity: selectedMechanic ? 1 : 0.7,
            }}
          >
            Toewijzen
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
