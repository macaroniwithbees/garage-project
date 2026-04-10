import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: Request) {
  const { appointment_id, totaalbedrag } = await req.json();

  const { error } = await supabaseAdmin.from("invoices").upsert(
    { appointment_id, totaalbedrag, betaald: "nee" },
    { onConflict: "appointment_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}