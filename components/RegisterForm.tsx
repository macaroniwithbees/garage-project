"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setMessage("Fout bij registreren: " + error.message);
    } else {
      setMessage(
        `Magic Link gestuurd! Check je e-mail om je account te activeren met ${email}`
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Welkom bij AutoGarage Pro
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Registreer uw account
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700">
            Vul uw e-mailadres
          </label>
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
          className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors"
        >
          Stuur Magic Link
        </button>
      </form>

      {message && (
        <p className="mt-4 text-center text-sm text-gray-600">
          {message}
        </p>
      )}

      <p className="mt-4 text-center text-gray-600">
        Heb je al een account?{" "}
        <a href="/login" className="text-blue-600 font-medium">
          Login hier
        </a>
      </p>

      <p className="mt-4 text-center text-gray-400 hover:underline cursor-pointer">
        <a href="/">&larr; Terug naar homepage</a>
      </p>
    </div>
  );
}