import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .limit(3);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return <h1>Check console voor Supabase test</h1>;
}
