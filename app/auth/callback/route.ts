import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(url.toString());

  if (error) {
    console.error("Error exchanging code for session:", error.message);
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  return NextResponse.redirect(new URL("/dashboard", url.origin));
}