import { createClient } from "@/lib/supabase/server";

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("rol")
    .eq("id", session.user.id)
    .single();

  return { user: session.user, role: profile?.rol ?? null };
}