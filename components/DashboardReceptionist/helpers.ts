import type { AppointmentStatus } from "./types";

export const normalizeStatus = (
  status: string | null | undefined,
): AppointmentStatus => {
  if (status === "ingepland") return "ingepland";
  if (status === "in behandeling" || status === "in_behandeling")
    return "in behandeling";
  if (status === "afgerond") return "afgerond";
  if (status === "klaar_voor_ophalen") return "klaar_voor_ophalen";
  return "in_afwachting";
};

export const toDateLabel = (dateValue: string | null): string | undefined => {
  if (!dateValue) return undefined;
  return new Date(dateValue).toLocaleDateString("nl-NL");
};
