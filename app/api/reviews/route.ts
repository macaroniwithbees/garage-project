import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Admin client die RLS omzeilt zodat we reviews kunnen opslaan
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

// POST: Sla een nieuwe review op voor een gebruiker
export async function POST(req: Request) {
  const { user_id, rating, comment } = await req.json();

  // Validatie: zonder gebruiker of rating kan de review niet opgeslagen worden
  if (!user_id || !rating) {
    return NextResponse.json(
      { error: "user_id en rating zijn verplicht" },
      { status: 400 },
    );
  }

  // Sla de review op in de database; comment is optioneel
  const { error } = await supabaseAdmin.from("reviews").insert({
    user_id,
    rating,
    comment: comment || null,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
