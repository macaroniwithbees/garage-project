"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthListener() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check initial session
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listener voor toekomstige changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      {user ? (
        <p>Welkom, {user.email}!</p>
      ) : (
        <p>Je bent niet ingelogd</p>
      )}
    </div>
  );
}
