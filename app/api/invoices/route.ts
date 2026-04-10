import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Admin client die RLS omzeilt zodat we facturen en afspraken kunnen wijzigen
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

// POST: Maak een nieuwe factuur aan (of update als er al één bestaat voor deze afspraak)
export async function POST(req: Request) {
  const { appointment_id, totaalbedrag } = await req.json();

  // Upsert: als er al een factuur is voor deze afspraak, update het bedrag; anders maak een nieuwe aan
  const { error } = await supabaseAdmin
    .from("invoices")
    .upsert(
      { appointment_id, totaalbedrag, betaald: "nee" },
      { onConflict: "appointment_id" },
    );

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PATCH: Verwerk een betaling — zet factuur op betaald en afspraak op afgerond
export async function PATCH(req: Request) {
  const { appointment_id } = await req.json();

  // Stap 1: Zet de factuur op betaald
  const { error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .update({ betaald: "ja" })
    .eq("appointment_id", appointment_id);

  if (invoiceError)
    return NextResponse.json({ error: invoiceError.message }, { status: 500 });

  // Stap 2: Zet de bijbehorende afspraak op afgerond
  const { error: appointmentError } = await supabaseAdmin
    .from("appointments")
    .update({ status: "afgerond" })
    .eq("id", appointment_id);

  if (appointmentError)
    return NextResponse.json(
      { error: appointmentError.message },
      { status: 500 },
    );

  return NextResponse.json({ success: true });
}
