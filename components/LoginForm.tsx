"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"success" | "error" | "">("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setType("error");
      setMessage("Fout bij inloggen: " + error.message);
    } else {
      setType("success");
      setMessage(
        `Magic Link gestuurd! Check je e-mail om in te loggen bij ${email}`,
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Welkom terug
      </h2>
      <p className="text-gray-600 text-center mb-6">Log in op uw account</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">E-mailadres</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="uw@email.nl"
            className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={!!message && type === "success"}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors"
        >
          Stuur Magic Link
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium transition-all duration-300
            ${
              type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
        >
          {type === "success" ? "✓" : "×"}
          {message}
        </div>
      )}

      <p className="mt-4 text-center text-gray-600">
        Nog geen account?{" "}
        <Link href="/register" className="text-blue-600 font-medium">
          Registreer hier
        </Link>
      </p>

      <p className="mt-4 text-center text-gray-400 hover:underline cursor-pointer">
        <Link href="/">&larr; Terug naar homepage</Link>
      </p>
    </div>
  );
}
